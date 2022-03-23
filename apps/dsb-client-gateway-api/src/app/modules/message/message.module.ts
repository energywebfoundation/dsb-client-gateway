import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway/events.gateway';
import { MessageService } from './service/message.service';
import { UtilsModule } from '../utils/utils.module';
import { MessageControlller } from './controller/message.controller';

@Module({
  imports: [UtilsModule],
  providers: [EventsGateway, MessageService],
  exports: [MessageService],
  controllers: [MessageControlller],
})
export class MessageModule { }
