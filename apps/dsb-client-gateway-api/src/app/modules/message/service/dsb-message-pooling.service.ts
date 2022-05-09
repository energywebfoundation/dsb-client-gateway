import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { WebSocketImplementation } from '../../message/message.const';
import { MessageService } from '../../message/service/message.service';
import { ChannelService } from '../../channel/service/channel.service';
import { GetMessageResponse } from '../../message/message.interface';
import { EventsGateway } from '../../message/gateway/events.gateway';
import { ChannelEntity } from '@dsb-client-gateway/dsb-client-gateway-storage';
import { DdhubLoginService } from '@dsb-client-gateway/ddhub-client-gateway-message-broker';

enum SCHEDULER_HANDLERS {
  MESSAGES = 'messages',
}

@Injectable()
export class DsbMessagePoolingService implements OnModuleInit {
  private readonly logger = new Logger(DsbMessagePoolingService.name);

  constructor(
    protected readonly ddhubLoginService: DdhubLoginService,
    protected readonly configService: ConfigService,
    protected readonly schedulerRegistry: SchedulerRegistry,
    protected readonly messageService: MessageService,
    protected readonly channelService: ChannelService,
    protected readonly gateway: EventsGateway,
  ) { }

  public async onModuleInit(): Promise<void> {
    const websocketMode = this.configService.get(
      'WEBSOCKET',
      WebSocketImplementation.NONE
    );

    if (websocketMode === WebSocketImplementation.NONE) {
      this.logger.log(`Websockets are disabled, not polling messages`);

      return;
    }

    this.logger.log('Enabling websockets');

    const callback = async () => {
      await this.handleInterval();
    };

    const timeout = setTimeout(callback, 5000);

    this.schedulerRegistry.addTimeout(SCHEDULER_HANDLERS.MESSAGES, timeout);
  }

  public async handleInterval(): Promise<void> {
    const callback = async () => {
      await this.handleInterval();
    };

    try {
      this.schedulerRegistry.deleteTimeout(SCHEDULER_HANDLERS.MESSAGES);

      const subscriptions: ChannelEntity[] = await (await this.channelService.getChannels()).filter((entity) => entity.type == 'sub');

      if (subscriptions.length === 0) {
        this.logger.log(
          'No subscriptions found. Push messages are enabled when the DID is added to a channel'
        );

        const timeout = setTimeout(callback, 60000);

        this.schedulerRegistry.addTimeout(SCHEDULER_HANDLERS.MESSAGES, timeout);

        return;
      }

      if (this.gateway.server.clients.size == 0) {
        return;
      }

      await this.ddhubLoginService.login().catch((e) => {
        this.logger.error(`Login failed`, e);
        return;
      });

      await this.pullMessagesAndEmit(subscriptions);
    } catch (e) {
      this.logger.error(e);
    } finally {
      const timeout = setTimeout(callback, 1000);

      this.schedulerRegistry.addTimeout(SCHEDULER_HANDLERS.MESSAGES, timeout);
    }
  }

  private async pullMessagesAndEmit(subscriptions: ChannelEntity[]): Promise<void> {
    const clientId: string = this.configService.get<string>(
      'CLIENT_ID',
      'WS-CONSUMER'
    );
    const messagesAmount: number = this.configService.get<number>(
      'EVENTS_MAX_PER_SECOND',
      2
    );

    for (const subscription of subscriptions) {
      const messages: GetMessageResponse[] = await this.messageService.getMessages({
        fqcn: subscription.fqcn,
        from: undefined,
        amount: messagesAmount,
        topicName: undefined,
        topicOwner: undefined,
        clientId,
      }
      );

      this.logger.log(`Found ${messages.length} in ${subscription.fqcn}`);

      if (messages && messages.length > 0) {
        await this.messageService.sendMessagesToSubscribers(
          messages,
          subscription.fqcn
        );
      }
    }
  }
}
