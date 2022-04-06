import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { InternalMessageEntity } from '../entity/message.entity';
import {
  AbstractLokiRepository,
  LokiService,
} from '@dsb-client-gateway/dsb-client-gateway-storage';

@Injectable()
export class InternalMessageRepository
  extends AbstractLokiRepository
  implements OnModuleInit
{
  private readonly logger = new Logger(InternalMessageRepository.name);

  constructor(protected readonly lokiService: LokiService) {
    super('internal-messages', lokiService);
  }

  public onModuleInit(): void {
    this.createCollectionIfNotExists(this.collection);
  }

  // change to getSymmetricKey, updateSymmetricKey

  public async saveInternalMessage(
    entity: InternalMessageEntity
  ): Promise<void> {
    this.logger.log(
      `Creating Internal message ${entity.clientGatewayMessageId}`
    );

    this.client
      .getCollection<InternalMessageEntity>(this.collection)
      .insert(entity);

    await this.lokiService.save();
  }

  public getInternalMessage(
    clientGatewayMessageId: string,
    senderDid: string
  ): InternalMessageEntity | null {
    this.logger.debug(`Retrieving InternalMessage ${clientGatewayMessageId}`);

    return this.client
      .getCollection<InternalMessageEntity>(this.collection)
      .findOne({
        clientGatewayMessageId,
        senderDid,
      });
  }

  public async updateInternalMessage(
    entity: InternalMessageEntity
  ): Promise<void> {
    this.logger.log(
      `Updating InternalMessage ${entity.clientGatewayMessageId} with ${entity.senderDid}`
    );

    this.client
      .getCollection<InternalMessageEntity>(this.collection)
      .update(entity);

    await this.lokiService.save();
  }

  public async delete(
    clientGatewayMessageId: string,
    senderDid: string
  ): Promise<void> {
    this.client
      .getCollection<InternalMessageEntity>(this.collection)
      .removeWhere({
        clientGatewayMessageId,
        senderDid,
      });

    await this.lokiService.save();
  }

  public getAll(): InternalMessageEntity[] {
    return this.client
      .getCollection<InternalMessageEntity>(this.collection)
      .find({});
  }
}
