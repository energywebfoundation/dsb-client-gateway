import { Injectable, Logger } from '@nestjs/common';
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
    protected readonly identityService: IdentityService
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

    const symmetricKey = 'ShVmYq3t6w9z$C&F'; // generate this from function after discussiin with Kris

    IsSchemaValid(topic.schema, dto.payload);
    const clientGatewayMessageId: string = uuidv4();
    const signature = await this.identityService.signPayload(
      JSON.stringify(dto.payload)
    );

    this.logger.log('Sending CipherText as Internal Message');

    await Promise.allSettled(
      qualifiedDids.map(async (recipient: string) => {
        await this.dsbApiService.sendMessageInternal(
          recipient,
          clientGatewayMessageId,
          JSON.stringify(dto.payload)
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

    const symmetricKey = 'ShVmYq3t6w9z$C&F'; // generate this from function after discussiin with Kris

    const clientGatewayMessageId: string = uuidv4();

    const signature = await this.identityService.signPayload(
      JSON.stringify({ data: 'take encrypted data' })
    );

    this.logger.log(
      'Sending CipherText as Internal Message to all qualified dids'
    );

    await Promise.allSettled(
      qualifiedDids.map(async (recipient: string) => {
        await this.dsbApiService.sendMessageInternal(
          recipient,
          clientGatewayMessageId,
          JSON.stringify({ data: 'take encrypted data' })
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
