import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ReconnectingWebSocket from 'reconnecting-websocket';
import WebSocket from 'ws';
import { WebSocketImplementation } from '../message.const';

@Injectable()
export class WsClientService implements OnModuleInit {
  private readonly logger = new Logger(WsClientService.name);
  public rws: ReconnectingWebSocket;

  constructor(protected readonly configService: ConfigService) { }

  public async onModuleInit(): Promise<void> {
    const websocketMode = this.configService.get(
      'WEBSOCKET',
      WebSocketImplementation.NONE
    );

    if (websocketMode !== WebSocketImplementation.CLIENT) {
      this.logger.log(`Websockets are disabled, client is disabled`);

      return;
    }

    const wsUrl: string | undefined = this.configService.get<
      string | undefined
    >('WEBSOCKET_URL');

    if (!wsUrl) {
      this.logger.error('WEBSOCKET_URL is not set');

      return;
    }

    await this.connect();
  }

  private async connect(): Promise<void> {
    const wsUrl: string = this.configService.get<string>('WEBSOCKET_URL');
    return new Promise((resolve, reject) => {
      try {
        const options = {
          WebSocket: WebSocket, // custom WebSocket constructor
          connectionTimeout: 1000,
          maxRetries: 10,
        };
        const _ws = new ReconnectingWebSocket(wsUrl, [], options);
        _ws.addEventListener('open', () => {
          this.rws = _ws;
          this.logger.log(`Websockets are connected`);
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
