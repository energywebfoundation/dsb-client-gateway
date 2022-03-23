import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway/events.gateway';
import { MessageService } from './service/message.service';
import { ChannelService } from '../channel/service/channel.service';
import { ChannelRepository } from '../channel/repository/channel.repository'
import { UtilsModule } from '../utils/utils.module';
import { MessageControlller } from './controller/message.controller';
import { DsbClientModule } from '../dsb-client/dsb-client.module';
import { ChannelModule } from '../channel/channel.module'
import { StorageModule } from '../storage/storage.module';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from '../identity/identity.module'
@Module({
  imports: [DsbClientModule, CqrsModule, UtilsModule, ChannelModule, IdentityModule, StorageModule],
  providers: [EventsGateway, MessageService, ChannelRepository, ChannelService],
  exports: [MessageService],
  controllers: [MessageControlller],
})
export class MessageModule { }
