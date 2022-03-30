import { ConsoleLogger, Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from '../gateway/events.gateway';
import { ConfigService } from '@nestjs/config';
import { Message } from '../../dsb-client/dsb-client.interface';
import { DsbApiService } from '../../dsb-client/service/dsb-api.service';
import {
  SendMessageDto,
  uploadMessageBodyDto,
} from '../dto/request/send-message.dto';
import { ChannelService } from '../../channel/service/channel.service';
import { TopicService } from '../../channel/service/topic.service';
import { IdentityService } from '../../identity/service/identity.service';
import { IsSchemaValid } from '../../utils/validator/decorators/IsSchemaValid';
import { TopicNotFoundException } from '../exceptions/topic-not-found.exception';
import { ChannelTypeNotPubException } from '../exceptions/channel-type-not-pub.exception';
import { SendMessageResponse } from '../message.interface';
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

  public async sendMessage(dto: SendMessageDto): Promise<SendMessageResponse> {
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

    this.logger.log('Validating schema');
    IsSchemaValid(topic.schema, dto.payload);

    this.logger.log('generating Client Gateway Message Id');
    const clientGatewayMessageId: string = uuidv4();

    this.logger.log('Generating Random Key');
    const randomKey: string = await this.keyService.generateRandomKey();

    this.logger.log('Encrypting Payload');
    const encryptedMessage = await this.keyService.encryptMessage(
      JSON.stringify(dto.payload),
      randomKey,
      'utf-8'
    );

    this.logger.log('Generating Signature');
    const signature = await this.identityService.signPayload(encryptedMessage);

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
      dto.payload,
      topic.topicId,
      topic.version,
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

    const signature = await this.identityService.signPayload(encryptedMessage);

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
