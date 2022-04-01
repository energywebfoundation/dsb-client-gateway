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

import { SecretsEngineService } from '../../secrets-engine/secrets-engine.interface';
import { ChannelService } from '../../channel/service/channel.service';
import { TopicService } from '../../channel/service/topic.service';
import { IdentityService } from '../../identity/service/identity.service';
import { IsSchemaValid } from '../../utils/validator/decorators/IsSchemaValid';
import { TopicNotFoundException } from '../exceptions/topic-not-found.exception';
import { ChannelTypeNotPubException } from '../exceptions/channel-type-not-pub.exception';
import { RecipientsNotFoundException } from '../exceptions/recipients-not-found-exception';
import { MessagesNotFoundException } from '../exceptions/messages-not-found.exception';
import { MessageSignatureNotValidException } from '../exceptions/messages-signature-not-valid.exception';
import {
  SendMessageResponse,
  SearchMessageResponseDto,
} from '../message.interface';
import { ChannelType } from '../../../modules/channel/channel.const';
import { EnrolmentRepository } from '../../storage/repository/enrolment.repository';

import { KeysService } from '../../keys/service/keys.service';

import { v4 as uuidv4 } from 'uuid';

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
    protected readonly enrolmentRepository: EnrolmentRepository
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

  public async getMessages({
    topicId,
    clientId,
    amount,
    from,
    senderId,
  }: GetMessagesDto): Promise<any> {
    const encryptedMessageResponse: Array<unknown> = [];

    const messages: SearchMessageResponseDto[] =
      await this.dsbApiService.messagesSearch(
        topicId,
        senderId,
        clientId,
        from,
        1
      );

    if (messages.length === 0) {
      throw new MessagesNotFoundException();
    }

    console.log('messages', messages);

    try {
      const result = await Promise.allSettled(
        messages.map(async (message: SearchMessageResponseDto) => {
          if (!message.isFile) {
            const isSignatureValid = await this.keyService.verifySignature(
              message.senderDid,
              message.signature,
              message.payload
            );

            console.log('isSignatureValid', isSignatureValid);

            if (isSignatureValid) {
              const decryptedMessage = await this.keyService.decryptMessage(
                message.payload,
                message.clientGatewayMessageId,
                message.senderDid
              );
              console.log('decryptedMessage', decryptedMessage);
              encryptedMessageResponse.push(decryptedMessage);
            } else {
              this.logger.error('Signature Not Matched');
              throw new MessageSignatureNotValidException();
            }
          }
        })
      );

      return result;
    } catch (e) {
      this.logger.error('Error while decryting messages in get messages ', e);
      throw new MessageSignatureNotValidException();
    }
  }

  public async downloadMessages({
    topicId,
    clientId,
    amount,
    from,
    senderId,
  }: GetMessagesDto): Promise<Array<unknown>> {
    const messages: SearchMessageResponseDto[] =
      await this.dsbApiService.messagesSearch(
        topicId,
        senderId,
        clientId,
        from,
        amount
      );
    const encryptedMessageResponse: Array<unknown> = [];

    try {
      await Promise.allSettled(
        messages.map(async (message: SearchMessageResponseDto) => {
          if (!message.isFile) {
            const isSignatureValid = await this.keyService.verifySignature(
              message.senderDid,
              message.signature,
              JSON.stringify(message.payload)
            );
            if (isSignatureValid) {
              const decryptedMessage = this.keyService.decryptMessage(
                JSON.stringify(message.payload),
                message.clientGatewayMessageId,
                message.senderDid
              );
              console.log('decryptedMessage', decryptedMessage);
              encryptedMessageResponse.push(decryptedMessage);
            }
          }
        })
      );
    } catch (e) {
      this.logger.error('Error while decryting messages in get messages ', e);
    }
    return encryptedMessageResponse;
  }

  public async sendMessage(dto: SendMessageDto): Promise<SendMessageResponse> {
    const channel = await this.channelService.getChannelOrThrow(dto.fqcn);

    console.log('channel', channel);

    const topic = await this.topicService.getTopic(
      dto.topicName,
      dto.topicOwner,
      dto.topicVersion
    );

    // if (!topic) {
    //   throw new TopicNotFoundException();
    // }
    console.log('topic', topic);

    const { qualifiedDids } = await this.channelService.getChannelQualifiedDids(
      dto.fqcn
    );

    // const qualifiedDids = [
    //   'did:ethr:volta:0x03830466Ce257f9B798B0f27359D7639dFB6457D',
    // ];

    if (qualifiedDids.length === 0) {
      throw new RecipientsNotFoundException();
    }

    // if (channel.type !== ChannelType.PUB) {
    //   throw new ChannelTypeNotPubException();
    // }

    this.logger.log('Validating schema');
    IsSchemaValid(
      {
        type: 'object',
        properties: {
          data: {
            type: 'number',
          },
        },
      },
      dto.payload
    );

    this.logger.log('generating Client Gateway Message Id');
    const clientGatewayMessageId: string = uuidv4();

    this.logger.log('Generating Random Key');
    const randomKey: string = await this.keyService.generateRandomKey();

    this.logger.log('Encrypting Payload');

    console.log('randomKey', randomKey);
    const encryptedMessage = await this.keyService.encryptMessage(
      JSON.stringify(dto.payload),
      randomKey,
      'utf-8' // put it const file
    );

    console.log('encryptedMessage', encryptedMessage);

    this.logger.log('fetching private key');
    const privateKey = await this.secretsEngineService.getPrivateKey();

    this.logger.log('Generating Signature');

    const signature = await this.keyService.createSignature(
      encryptedMessage,
      '0x' + privateKey
    );

    console.log('signature', signature);

    this.logger.log('Sending CipherText as Internal Message');

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

    this.logger.log('Sending Message');

    return this.dsbApiService.sendMessage(
      qualifiedDids,
      encryptedMessage,
      '62453a51ab8d1b108a880af7',
      '2.0.0',
      signature,
      clientGatewayMessageId,
      dto.transactionId
    );
  }

  public async uploadMessage(
    file: Express.Multer.File,
    dto: uploadMessageBodyDto
  ): Promise<SendMessageResponse> {
    const channel = await this.channelService.getChannelOrThrow(dto.fqcn);
    const topic = await this.topicService.getTopic(
      dto.topicName,
      dto.topicOwner,
      dto.topicVersion
    );
    const { qualifiedDids } = await this.channelService.getChannelQualifiedDids(
      dto.fqcn
    );

    if (!topic) {
      throw new TopicNotFoundException();
    }

    if (channel.type !== ChannelType.PUB) {
      throw new ChannelTypeNotPubException();
    }

    this.logger.log('generating Client Gateway Message Id');
    const clientGatewayMessageId: string = uuidv4();

    this.logger.log('Generating Random Key');
    const randomKey: string = await this.keyService.generateRandomKey();

    this.logger.log('Encrypting Payload');
    const encryptedMessage = await this.keyService.encryptMessage(
      JSON.stringify(file.buffer),
      randomKey,
      'utf-8'
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

    try {
      await Promise.allSettled(
        qualifiedDids.map(async (recipientDid: string) => {
          const decryptionCiphertext =
            await this.keyService.encryptSymmetricKey(randomKey, recipientDid);

          await this.dsbApiService.sendMessageInternal(
            recipientDid,
            clientGatewayMessageId,
            decryptionCiphertext
          );
        })
      );
    } catch (e) {
      this.logger.error(
        'error while sending internal messages in file upload',
        e
      );
    }

    return this.dsbApiService.uploadFile(
      file,
      qualifiedDids,
      topic.topicId,
      dto.topicVersion,
      signature,
      clientGatewayMessageId,
      dto.transactionId
    );
  }
}
