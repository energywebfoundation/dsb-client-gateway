import { Controller, Get } from '@nestjs/common';
import { DsbApiService } from './service/dsb-api.service';

@Controller('channels')
export class DsbClientController {
  constructor(
    protected readonly dsbClientService: DsbApiService,
  ) {
  }

  @Get()
  public async getChannels() {
    return this.dsbClientService.getChannels();
  }
}
