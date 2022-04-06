import { ConsoleLogger, Injectable, Logger } from '@nestjs/common';
import { IamService } from '@dsb-client-gateway/dsb-client-gateway-iam-client';
import { MessageService } from './message.service';
import { DsbApiService } from '../../dsb-client/service/dsb-api.service';
import { InternalMessageEntity } from '../entity/message.entity';
import { InternalMessageRepository } from '../repository/internal-messages.repository';

@Injectable()
export class InternalMessageCacheService {
  private readonly logger = new Logger(InternalMessageCacheService.name);

  constructor(
    protected readonly messageService: MessageService,
    protected readonly dsbApiService: DsbApiService,
    protected readonly internalMessageRepository: InternalMessageRepository
  ) {}

  public async refreshInternalMessageCache(): Promise<void> {
    const internalMesssages: InternalMessageEntity[] =
      await this.dsbApiService.getInternalMessages('mb-default'); //set client id as something unique (address)

    console.log('internalMesssages', internalMesssages);

    if (internalMesssages.length === 0) {
      this.logger.log('No internal Messages, job not running');
    }

    //continue running cron
  }
}
