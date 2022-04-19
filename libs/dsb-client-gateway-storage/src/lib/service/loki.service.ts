import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import loki from 'lokijs';

@Injectable()
export class LokiService implements OnModuleInit, OnApplicationShutdown {
  public readonly client: loki;

  constructor() {
    this.client = new loki('data.db', {
      autoload: true,
      // persistenceMethod: 'fs',
      autosave: true,
      // autosaveInterval: 1,
      serializationMethod: 'pretty',
      throttledSaves: true,
    });
  }

  public async onApplicationShutdown(signal?: string): Promise<void> {
    await this.save();
  }

  public async save(): Promise<void> {
    const promise = () =>
      new Promise((resolve, reject) => {
        this.client.saveDatabase((err) => {
          if (err) {
            return reject(err);
          }

          return resolve(null);
        });
      });

    await promise();
  }

  public async onModuleInit(): Promise<void> {
    const promise = () =>
      new Promise((resolve, reject) => {
        console.log(' onModuleInit of loadDatabase ', this.client.loadDatabase);

        this.client.loadDatabase({}, (err) => {
          if (err) {
            console.error(err);

            reject(err);
          }

          resolve(null);
        });
      });

    await promise();
  }

  public createCollectionIfNotExists(name: string, options): void {
    const collection = this.client.getCollection(name);

    if (collection === null) {
      this.client.addCollection(name, options);
    }
  }
}
