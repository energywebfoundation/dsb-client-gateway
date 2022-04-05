import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DidRegistryListenerService } from '../../../../../../../libs/dsb-client-gateway-did-registry/src/lib/service/did-registry-listener.service';

@Injectable()
export class DidListenerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DidListenerService.name);

  constructor(
    protected readonly didRegistryListenerService: DidRegistryListenerService
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.didRegistryListenerService.startListening();

    this.logger.log('Listening for DID Attribute changees');
  }
}
