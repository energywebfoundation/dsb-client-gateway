import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IdentityService } from './service/identity.service';
import { Identity } from '../storage/storage.interface';
import { CreateIdentityDto } from './dto/create-identity.dto';

@Controller('identity')
export class IdentityController {
  constructor(
    protected readonly identityService: IdentityService
  ) {}

  @Get('')
  public async get(): Promise<Identity> {
    return this.identityService.getIdentity();
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  public async post(@Body() { privateKey }: CreateIdentityDto): Promise<void> {
    await this.identityService.createIdentity(privateKey);
  }
}
