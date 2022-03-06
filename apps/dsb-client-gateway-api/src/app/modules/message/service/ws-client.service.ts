import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Message } from '../../dsb-client/dsb-client.interface';
import { ConfigService } from '@nestjs/config';
import { WebSocketImplementation } from '../message.const';

@Injectable()
export class WsClientService implements OnModuleInit {
  private readonly logger = new Logger(WsClientService.name);

  constructor(protected readonly configService: ConfigService) {}

  public onModuleInit(): void {
    const websocketMode = this.configService.get(
      'WEBSOCKET',
      WebSocketImplementation.NONE
    );

    if (websocketMode === WebSocketImplementation.NONE) {
      this.logger.log(`Websockets are disabled, not polling messages`);

      return;
    }
  }

  public async sendMessage(messages: Message[]): Promise<void> {}
}
