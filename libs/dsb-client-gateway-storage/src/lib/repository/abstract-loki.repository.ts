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

  protected async createCollectionIfNotExistsAsync(
    name: string,
    indices: string[] = []
  ): Promise<void> {
    const collection = this.client.getCollection(name);

    if (collection === null) {
      if (indices.length > 0) {
        this.client.addCollection(name, {
          indices,
        });

        return;
      }

      this.client.addCollection(name);
    }

    // await this.lokiService.save();
  }

  protected createCollectionIfNotExists(
    name: string,
    indices: string[] = []
  ): void {
    const collection = this.client.getCollection(name);

    if (collection === null) {
      if (indices.length > 0) {
        this.client.addCollection(name, {
          indices,
        });

        return;
      }

      this.client.addCollection(name);
    }
  }

  protected getCollection(): loki.Collection<T> {
    return this.client.getCollection<T>(this.collection);
  }
}
