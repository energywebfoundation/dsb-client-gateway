import { Controller, Get, Res } from '@nestjs/common';
import { DsbApiService } from './service/dsb-api.service';
import { Response } from 'express';

@Controller('dsb')
export class DsbClientController {
  constructor(
    protected readonly dsbClientService: DsbApiService
  ) {
  }

  @Get('channels')
  public async getChannels() {
    return this.dsbClientService.getChannels();
  }

  @Get('health')
  public async getHealth(
    @Res() res: Response
  ) {
    const { statusCode, message } = await this.dsbClientService.health();

    if(statusCode === 200) {
      return res.status(statusCode).end();
    }

    return res.status(statusCode).json({
      err: message
    });
  }
}
