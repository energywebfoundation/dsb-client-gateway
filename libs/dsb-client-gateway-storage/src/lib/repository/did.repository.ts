import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { DidEntity } from '../entity/did.entity';
import { LokiService } from '../service/loki.service';
import { AbstractLokiRepository } from './abstract-loki.repository';

@Injectable()
export class DidRepository
  extends AbstractLokiRepository<DidEntity>
  implements OnModuleInit
{
  private readonly logger = new Logger(DidRepository.name);

  constructor(protected readonly lokiService: LokiService) {
    super('did', lokiService);
  }

  public async onModuleInit(): Promise<void> {
    await this.createCollectionIfNotExistsAsync(this.collection);
  }

  public async upsertDid(
    did: string,
    publicRSAKey?: string,
    publicSignatureKey?: string
  ): Promise<void> {
    this.createCollectionIfNotExists(this.collection);

    const entity: DidEntity | null = this.client
      .getCollection<DidEntity>(this.collection)
      .findOne({
        id: did,
      });

    if (!entity) {
      this.logger.log(`Storing DID ${did} in cache`);

      this.client.getCollection<DidEntity>(this.collection).insert({
        id: did,
        publicRSAKey,
        publicSignatureKey,
      });

      await this.lokiService.save();

      return;
    }

    this.logger.log(`Updating DID ${did}`);

    this.client.getCollection<DidEntity>(this.collection).updateWhere(
      ({ id }) => id === did,
      (obj) => obj
    );

    await this.lokiService.save();
  }
}
