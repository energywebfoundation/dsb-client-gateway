import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SymmetricKeyEntity } from '../entity/message.entity';

import moment from 'moment';

import {
  AbstractLokiRepository,
  LokiService,
} from '@dsb-client-gateway/dsb-client-gateway-storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SymmetricKeysRepository
  extends AbstractLokiRepository
  implements OnModuleInit
{
  private readonly logger = new Logger(SymmetricKeysRepository.name);
  private ttlInterval;
  private ttl;

  constructor(
    protected readonly lokiService: LokiService,
    protected readonly configService: ConfigService
  ) {
    super('symmetric keys', lokiService);
    this.ttlInterval = this.configService.get('TTL_INTERVAL');
    this.ttl = this.configService.get('TTL');
  }

  public onModuleInit(): void {
    this.createCollectionIfNotExists(this.collection, [], this.ttlInterval);
    // just to ensure if data.db file is not deleted still TTL is set
    const collection = this.client.getCollection<SymmetricKeyEntity>(
      this.collection
    );
    this.logger.log('setting TTL for symmetric keys collection');
    collection.setTTL(this.ttl, this.ttlInterval);
  }

  public async createOrUpdateSymmetricKey(
    data: SymmetricKeyEntity
  ): Promise<void> {
    this.logger.debug(
      `Creating or updating Internal message clientGatewayMessageId:${data.clientGatewayMessageId} and senderDid: ${data.senderDid}`
    );

    const currentSymmetricKey: SymmetricKeyEntity | null = this.getSymmetricKey(
      data.clientGatewayMessageId,
      data.senderDid
    );

    this.logger.log('current symmetric key', currentSymmetricKey);

    if (currentSymmetricKey) {
      this.logger.debug(
        `InternalMessage with clientGatewayMessageId: ${data.clientGatewayMessageId} 
         and senderDid: ${data.senderDid} already exists so updating`
      );

      const newObject = {
        clientGatewayMessageId: data.clientGatewayMessageId,
        payload: data.payload,
        senderDid: data.senderDid,
        updatedAt: moment().toISOString(),
      };

      this.client
        .getCollection<SymmetricKeyEntity>(this.collection)
        .update(newObject);

      await this.lokiService.save();

      return;
    }

    const key = this.client
      .getCollection<SymmetricKeyEntity>(this.collection)
      .insert({
        clientGatewayMessageId: data.clientGatewayMessageId,
        payload: data.payload,
        senderDid: data.senderDid,
        createdAt: moment().toISOString(),
        updatedAt: moment().toISOString(), // use timestamp from data
      });

    this.logger.log('symmetric key inserted', key);

    await this.lokiService.save();
  }

  public getSymmetricKey(
    clientGatewayMessageId: string,
    senderDid: string
  ): SymmetricKeyEntity | null {
    this.logger.debug(
      `Retrieving symmetric Key for clientGatewayMessageId: ${clientGatewayMessageId} and senderDid: ${senderDid}`
    );

    const data = this.client
      .getCollection<SymmetricKeyEntity>(this.collection)
      .findOne({
        clientGatewayMessageId,
        senderDid,
      });

    this.logger.log('data in getSymmetricKey', data);

    return data;
  }

  public getAll(): SymmetricKeyEntity[] {
    return this.client
      .getCollection<SymmetricKeyEntity>(this.collection)
      .find({});
  }
}
