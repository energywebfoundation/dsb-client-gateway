import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from '../gateway/events.gateway';
import { ConfigService } from '@nestjs/config';
import { Message } from '../../dsb-client/dsb-client.interface';
import { DsbApiService } from '../../dsb-client/service/dsb-api.service';
import {
  SendMessageDto,
  uploadMessageBodyDto,
} from '../dto/request/send-message.dto';
import { GetMessagesDto } from '../dto/request/get-messages.dto';
import { InternalMessageDto } from '../dto/response/get-internal-message.dto';
import { InternalMessageRepository } from '../repository/internal-messages.repository';

// import { SecretsEngineService } from '../../secrets-engine/secrets-engine.interface';
import { ChannelService } from '../../channel/service/channel.service';
import { TopicService } from '../../channel/service/topic.service';
import { IdentityService } from '../../identity/service/identity.service';
import { IsSchemaValid } from '../../utils/validator/decorators/IsSchemaValid';
import { TopicNotFoundException } from '../exceptions/topic-not-found.exception';
import { ChannelTypeNotPubException } from '../exceptions/channel-type-not-pub.exception';
import { RecipientsNotFoundException } from '../exceptions/recipients-not-found-exception';
import { MessageSignatureNotValidException } from '../exceptions/messages-signature-not-valid.exception';
import { InternalMessageNotFoundException } from '../exceptions/internal-message-exception';
import { TopicOwnerTopicNameRequiredException } from '../exceptions/topic-owner-and-topic-name-required.exception';
import { MessageDecryptionFailedException } from '../exceptions/message-decryption-failed.exception';
import { FileSizeException } from '../exceptions/file-size.exception';
import { FIleTypeNotSupportedException } from '../exceptions/file-type-not-supported.exception';
import {
  SendMessageResponse,
  SearchMessageResponseDto,
  GetMessageResponse,
  DownloadMessageResponse,
} from '../message.interface';
import { ChannelType } from '../../../modules/channel/channel.const';
import { EnrolmentRepository } from '../../storage/repository/enrolment.repository';
import { KeysService } from '../../keys/service/keys.service';
import { SecretsEngineService } from '@dsb-client-gateway/dsb-client-gateway-secrets-engine';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { join } from 'path';
import moment from 'moment';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshInternalMessagesCacheCommand } from '../command/refresh-internal-messages-cache.command';
import { InternalMessageEntity } from '../entity/message.entity';

export enum EventEmitMode {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
}

@Injectable()
export class MessageService {
  protected readonly logger = new Logger(MessageService.name);

  constructor(
    protected readonly secretsEngineService: SecretsEngineService,
    protected readonly gateway: EventsGateway,
    protected readonly configService: ConfigService,
    protected readonly dsbApiService: DsbApiService,
    protected readonly channelService: ChannelService,
    protected readonly topicService: TopicService,
    protected readonly identityService: IdentityService,
    protected readonly keyService: KeysService,
    protected readonly enrolmentRepository: EnrolmentRepository,
    // protected readonly vaultService: VaultService,
    protected readonly internalMessageRepository: InternalMessageRepository,
    protected readonly commandBus: CommandBus
  ) {}

  public async sendMessagesToSubscribers(
    messages: Message[],
    fqcn: string
  ): Promise<void> {
    const emitMode: EventEmitMode = this.configService.get(
      'EVENTS_EMIT_MODE',
      EventEmitMode.BULK
    );

    if (emitMode === EventEmitMode.BULK) {
      this.broadcast(messages.map((message) => ({ ...message, fqcn })));

      return;
    }

    messages.forEach((message: Message) => {
      this.broadcast({ ...message, fqcn });
    });
  }

  private broadcast(data): void {
    this.gateway.server.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  }

  public async sendMessage(dto: SendMessageDto): Promise<SendMessageResponse> {
    const channel = await this.channelService.getChannelOrThrow(dto.fqcn);

    const topic = await this.topicService.getTopic(
      dto.topicName,
      dto.topicOwner,
      dto.topicVersion
    );

    if (!topic) {
      throw new TopicNotFoundException('NOT Found');
    }

    const qualifiedDids = channel.conditions.qualifiedDids;

    if (qualifiedDids.length === 0) {
      throw new RecipientsNotFoundException();
    }

    if (channel.type !== ChannelType.PUB) {
      throw new ChannelTypeNotPubException();
    }

    this.logger.log('Validating schema');
    IsSchemaValid(topic.schemaType, topic.schema, dto.payload);

    this.logger.log('generating Client Gateway Message Id');
    const clientGatewayMessageId: string = uuidv4();

    this.logger.log('Generating Random Key');
    // const randomKey: string = await this.keyService.generateRandomKey();
    const randomKey: string =
      '7479377c81201eb89b90b11dda72bdc89b6473d6d1d60d4dad23c495b22e794d';

    this.logger.log('Encrypting Payload');

    const encryptedMessage = await this.keyService.encryptMessage(
      dto.payload,
      randomKey,
      'utf-8' // put it const file
    );

    this.logger.log('fetching private key');
    const privateKey = await this.secretsEngineService.getPrivateKey();

    this.logger.log('Generating Signature');

    const signature = await this.keyService.createSignature(
      encryptedMessage,
      '0x' + privateKey
    );

    this.logger.log('Sending CipherText as Internal Message');

    await Promise.allSettled(
      qualifiedDids.map(async (recipientDid: string) => {
        const encryptedSymmetricKey = await this.keyService.encryptSymmetricKey(
          randomKey,
          recipientDid
        );
        await this.dsbApiService.sendMessageInternal(
          recipientDid,
          clientGatewayMessageId,
          encryptedSymmetricKey
        );
      })
    ).catch((e) => {
      this.logger.error(
        'Error while Sending CipherText as Internal Message to recipients',
        e
      );
      throw new Error(e);
    });

    this.logger.log('Sending Message');

    return this.dsbApiService.sendMessage(
      qualifiedDids,
      encryptedMessage,
      topic.topicId,
      topic.version,
      signature,
      clientGatewayMessageId,
      dto.transactionId
    );
  }

  public async getMessages({
    fqcn,
    from,
    amount,
    topicName,
    topicOwner,
    clientId,
  }: GetMessagesDto): Promise<GetMessageResponse[]> {
    const getMessagesResponse: Array<GetMessageResponse> = [];

    const channel = await this.channelService.getChannelOrThrow(fqcn);

    // topic owner and topic name should be present
    if ((topicOwner && !topicName) || (!topicOwner && topicName)) {
      throw new TopicOwnerTopicNameRequiredException('');
    }

    //Get Topic Ids
    let topicIds = [];
    if (!topicName && !topicOwner) {
      topicIds = channel.conditions.topics.map((topic) => topic.topicId);
    } else {
      const topic = await this.topicService.getTopic(topicName, topicOwner);
      topicIds.push(topic.topicId);
    }

    // call message search
    const messages: Array<SearchMessageResponseDto> =
      await this.dsbApiService.messagesSearch(
        topicIds,
        channel.conditions.qualifiedDids,
        clientId,
        from,
        amount
      );

    //no messages then return empty array
    if (messages.length === 0) {
      return [];
    }

    //validate signature and decrypt messages
    await Promise.allSettled(
      messages.map(async (message: SearchMessageResponseDto) => {
        const result: GetMessageResponse = {
          id: message.messageId,
          topicName: topicName,
          topicOwner: topicOwner,
          topicVersion: message.topicVersion,
          payload: message.payload,
          signature: message.signature,
          sender: message.senderDid,
          timestampNanos: message.timestampNanos,
          transactionId: message.transactionId,
          signatureValid: false,
          decryption: { status: true },
        };

        if (!message.isFile) {
          //signature validation
          const isSignatureValid = await this.keyService.verifySignature(
            message.senderDid,
            message.signature,
            message.payload
          );

          this.logger.debug(
            `signature matching result for message with id ${message.messageId}`,
            isSignatureValid
          );

          if (isSignatureValid) {
            result.signatureValid = true;

            try {
              const decryptedMessage = await this.keyService.decryptMessage(
                message.payload,
                message.clientGatewayMessageId,
                message.senderDid
              );

              result.payload = decryptedMessage;

              this.logger.debug(
                `decrypting Message for message with id ${message.messageId}`
              );
            } catch (error) {
              result.decryption.status = false;
              result.decryption.errorMessage = JSON.stringify(error);
            }
          }
        }

        getMessagesResponse.push(result);
      })
    );

    return getMessagesResponse;
  }

  public async uploadMessage(
    file: Express.Multer.File,
    dto: uploadMessageBodyDto
  ): Promise<SendMessageResponse> {
    // file validations
    if (!file.originalname.match(/\.(csv)$/)) {
      throw new FIleTypeNotSupportedException('');
    }

    if (file.size > this.configService.get('MAX_FILE_SIZE')) {
      throw new FileSizeException('');
    }

    //Check if internal channel exists
    const channel = await this.channelService.getChannelOrThrow(dto.fqcn);

    //System gets topic details from cache
    const topic = await this.topicService.getTopic(
      dto.topicName,
      dto.topicOwner,
      dto.topicVersion
    );

    //Check if topic exists
    if (!topic) {
      throw new TopicNotFoundException('TOPIC NOT FOUND');
    }

    //System gets internal channel details
    const qualifiedDids = channel.conditions.qualifiedDids;

    // return error if no recipients
    if (qualifiedDids.length === 0) {
      throw new RecipientsNotFoundException();
    }

    if (channel.type !== ChannelType.UPLOAD) {
      throw new ChannelTypeNotPubException();
    }

    this.logger.log('generating Client Gateway Message Id');
    const clientGatewayMessageId: string = uuidv4();

    this.logger.log('Generating Random Key');
    // const randomKey: string = await this.keyService.generateRandomKey();
    const randomKey: string =
      '7479377c81201eb89b90b11dda72bdc89b6473d6d1d60d4dad23c495b22e794d';

    this.logger.log('Encrypting Payload');
    const encryptedMessage = await this.keyService.encryptMessage(
      JSON.stringify(file.buffer),
      randomKey,
      'utf-8'
    );

    await fs.writeFileSync(
      __dirname + '/../../../' + 'encryptedMessage.txt',
      Buffer.from(encryptedMessage)
    );

    this.logger.log('fetching private key');
    const privateKey = await this.secretsEngineService.getPrivateKey();

    this.logger.log('Generating Signature');
    const signature = await this.keyService.createSignature(
      encryptedMessage,
      '0x' + privateKey
    );

    this.logger.log(
      'Sending CipherText as Internal Message to all qualified dids'
    );

    await Promise.allSettled(
      qualifiedDids.map(async (recipientDid: string) => {
        const decryptionCiphertext = await this.keyService.encryptSymmetricKey(
          randomKey,
          recipientDid
        );

        await this.dsbApiService.sendMessageInternal(
          recipientDid,
          clientGatewayMessageId,
          decryptionCiphertext
        );
      })
    );

    //uploading file
    return this.dsbApiService.uploadFile(
      file,
      qualifiedDids,
      topic.topicId,
      topic.version,
      signature,
      encryptedMessage,
      clientGatewayMessageId,
      dto.transactionId
    );
  }

  public async downloadMessages(
    fileId: string
  ): Promise<DownloadMessageResponse> {
    //Calling download file API of message broker
    const fileResponse = await this.dsbApiService.downloadFile(fileId);
    //getting file name from headers
    const fileName = fileResponse.headers['content-disposition']
      .split('=')[1]
      .replaceAll('"', '');

    //Verifying signature
    const isSignatureValid = await this.keyService.verifySignature(
      fileResponse.headers.ownerdid,
      fileResponse.headers.signature,
      fileResponse.data
    );

    // Return error that signature is invalid
    if (!isSignatureValid) {
      this.logger.error(`Signature not matched for file id: ${fileId}`);
      throw new MessageSignatureNotValidException(
        `Signature not matched for file id: ${fileId}`
      );
    } else {
      let decryptedMessage: string;
      let decryptionSucesssfull: boolean;
      let decrypted: any;

      try {
        // Decrypting File Content
        this.logger.debug(`decrypting Message for File Id  ${fileId}`);

        decryptedMessage = await this.keyService.decryptMessage(
          fileResponse.data,
          fileResponse.headers.clientgatewaymessageid,
          fileResponse.headers.ownerdid
        );

        this.logger.debug(`Completed decryption for file id:${fileId}`);
      } catch (e) {
        decryptionSucesssfull = false;
        throw new MessageDecryptionFailedException(JSON.stringify(e));
      }

      if (!decryptedMessage) {
        throw new MessageDecryptionFailedException('');
      }

      try {
        // Parsing Decrypted data
        decrypted = JSON.parse(decryptedMessage);
      } catch (e) {
        throw new MessageDecryptionFailedException(
          'Decryted Message cannot be parsed to JSON object.'
        );
      }

      const dir = __dirname + '/../../../files/';

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      // writing the data to a file
      await fs.writeFileSync(dir + fileName, Buffer.from(decrypted.data));
    }

    return {
      filePath: join(__dirname + '/../../../files/' + fileName),
      fileName: fileName,
      sender: fileResponse.headers.ownerdid,
      signature: fileResponse.headers.signature,
      clientGatewayMessageId: fileResponse.headers.clientgatewaymessageid,
    };
  }

  public async createInternalMessage(
    internalMessage: InternalMessageDto
  ): Promise<void> {
    this.logger.log(
      `Attempting to create Internal Message ${internalMessage.clientGatewayMessageId}`
    );

    this.logger.debug(internalMessage);

    const creationDate: string = moment().toISOString();

    await this.internalMessageRepository.saveInternalMessage({
      transactionId: internalMessage.transactionId,
      clientGatewayMessageId: internalMessage.clientGatewayMessageId,
      payload: internalMessage.payload,
      topicId: internalMessage.topicId,
      topicVersion: internalMessage.topicVersion,
      signature: internalMessage.signature,
      isFile: internalMessage.isFile,
      senderDid: internalMessage.senderDid,
      createdAt: creationDate,
      updatedAt: creationDate,
    });

    this.logger.log(
      `Internal Message with clientGatewayMessageId ${internalMessage.clientGatewayMessageId} created`
    );

    await this.commandBus.execute(new RefreshInternalMessagesCacheCommand());
  }

  public getInternalMessage(
    clientGatewayMessageId: string,
    senderDid: string
  ): InternalMessageEntity | null {
    return this.internalMessageRepository.getInternalMessage(
      clientGatewayMessageId,
      senderDid
    );
  }

  public getInternalMessageorThrow(
    clientGatewayMessageId: string,
    senderDid: string
  ): InternalMessageEntity {
    const internalMessage: InternalMessageEntity | null =
      this.getInternalMessage(clientGatewayMessageId, senderDid);

    if (!internalMessage) {
      throw new InternalMessageNotFoundException('');
    }

    return internalMessage;
  }

  public async deleteInternalMessageorThrow(
    clientGatewayMessageId: string,
    senderDid: string
  ): Promise<void> {
    const channel = this.getInternalMessageorThrow(
      clientGatewayMessageId,
      senderDid
    );

    await this.internalMessageRepository.delete(
      clientGatewayMessageId,
      senderDid
    );

    await this.commandBus.execute(new RefreshInternalMessagesCacheCommand());
  }
}
