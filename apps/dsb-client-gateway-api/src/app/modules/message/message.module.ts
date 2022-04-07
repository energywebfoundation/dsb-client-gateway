import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway/events.gateway';
import { MessageService } from './service/message.service';
import { SymmetricKeysRepository } from './repository/symmetric-keys.repository';
import { UtilsModule } from '../utils/utils.module';
import { MessageControlller } from './controller/message.controller';
import { DsbClientModule } from '../dsb-client/dsb-client.module';
import { ChannelModule } from '../channel/channel.module';
import { StorageModule } from '../storage/storage.module';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from '../identity/identity.module';
import { VaultService } from '../secrets-engine/service/vault.service';
import { KeysModule } from '../keys/keys.module';
import { SymmetricKeysCacheService } from './service/symmetric-keys-cache.service';
import { RefreshSymmetricKeysCacheHandler } from './service/refresh-symmetric-keys-cache.handler';
import { RefreshSymmetricKeysCacheCronService } from './service/refresh-symmetric-keys-cache-cron.service';

@Module({
  imports: [
    CqrsModule,
    UtilsModule,
    ChannelModule,
    IdentityModule,
    StorageModule,
    KeysModule,
    DsbClientModule,
  ],
  providers: [
    SymmetricKeysRepository,
    MessageService,
    VaultService,
    EventsGateway,
    RefreshSymmetricKeysCacheCronService,
    RefreshSymmetricKeysCacheHandler,
    SymmetricKeysCacheService,
  ],
  exports: [MessageService],
  controllers: [MessageControlller],
})
export class MessageModule {}
