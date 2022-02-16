import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { ConfigService } from '@nestjs/config';
import { providers } from 'ethers';

@Module({
  providers: [{
    provide: EthersService,
    useFactory: (configService: ConfigService) => {
      const provider = new providers.JsonRpcProvider(configService.get<string>('RPC_URL', 'https://volta-rpc.energyweb.org/'));

      return new EthersService(provider);
    },
    inject: [ConfigService]
  }],
  exports: [EthersService]
})
export class UtilsModule {
}
