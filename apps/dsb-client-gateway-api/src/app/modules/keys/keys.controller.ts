import { Controller, Post } from '@nestjs/common';
import { KeysService } from './service/keys.service';

@Controller('keys')
export class KeysController {
  constructor(
    protected readonly keysService: KeysService,
  ) {
  }

  @Post('')
  public async derive(): Promise<void> {
    await this.keysService.deriveKeys();
  }
}
