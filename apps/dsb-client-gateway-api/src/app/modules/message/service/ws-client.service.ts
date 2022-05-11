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

  public async connect(): Promise<void> {
    const wsUrl: string = this.configService.get<string>('WEBSOCKET_URL');
    return new Promise((resolve, reject) => {
      try {
        if (this.rws == null) {
          const options = {
            WebSocket: WebSocket, // custom WebSocket constructor
            connectionTimeout: 5000,
          };
          const _ws = new ReconnectingWebSocket(wsUrl, [], options);
          _ws.addEventListener('open', () => {
            if (this.rws == null) {
              this.rws = _ws;
              this.logger.log(`Websockets are connected`);
            } else {
              this.logger.log(`Websockets are re-connected`);
            }
            resolve();
          });
          _ws.addEventListener('close', () => {
            resolve();
          });
        } else {
          resolve();
        }

      } catch (err) {
        reject(err);
      }
    });
  }
}
