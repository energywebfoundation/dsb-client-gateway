import { Injectable } from '@nestjs/common';
import { LokiService } from '../service/loki.service';
import loki from 'lokijs';

@Injectable()
export abstract class AbstractLokiRepository<T extends object = any> {
  public readonly client: loki;

  protected constructor(
    protected readonly collection: string,
    protected readonly lokiService: LokiService
  ) {
    this.client = lokiService.client;
  }

  protected createCollectionIfNotExists(
    name: string,
    indices: string[] = [],
    ttlInterval?: number
  ): void {
    const collection = this.client.getCollection(name);

    const options: { indices: string[]; ttlInterval?: number; ttl?: number } = {
      indices,
    };

    if (ttlInterval) {
      options.ttl = ttlInterval;
      options.ttlInterval = ttlInterval;
    }

    if (collection === null) {
      this.client.addCollection(name, options);
    }
  }

  protected getCollection(): loki.Collection<T> {
    return this.client.getCollection<T>(this.collection);
  }
}
