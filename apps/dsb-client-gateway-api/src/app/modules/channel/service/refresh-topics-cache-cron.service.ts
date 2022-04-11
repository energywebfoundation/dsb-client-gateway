import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { RefreshAllChannelsCacheDataCommand } from '../command/refresh-all-channels-cache-data.command';

@Injectable()
export class RefreshTopicsCacheCronService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RefreshTopicsCacheCronService.name);

  constructor(
    protected readonly commandBus: CommandBus,
    protected readonly configService: ConfigService,
    protected readonly schedulerRegistry: SchedulerRegistry
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    const scheduledJobsEnabled: boolean = this.configService.get<boolean>(
      'SCHEDULED_JOBS',
      true
    );

    if (!scheduledJobsEnabled) {
      this.logger.log(`Cron jobs not enabled`);

      return;
    }

    this.logger.log(`Cron jobs enabled`);

    // @TODO Make this configurable
    const job = new CronJob(`*/5 * * * *`, async () => {
      this.logger.log(`${jobName} CRON job triggered`);

      await this.commandBus.execute(new RefreshAllChannelsCacheDataCommand());
    });

    const jobName = 'REFRESH_TOPICS_CACHE';

    this.schedulerRegistry.addCronJob(jobName, job);

    job.start();
  }
}
