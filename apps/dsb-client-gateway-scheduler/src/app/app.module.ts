import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidate } from './utils/config.validate';
import { DdhubClientGatewayTracingModule } from '@dsb-client-gateway/ddhub-client-gateway-tracing';
import { AppInitService } from './app-init.service';
import { DdhubClientGatewayUtilsModule } from '@dsb-client-gateway/ddhub-client-gateway-utils';
import { ScheduleModule } from '@nestjs/schedule';
import { IamModule } from '@dsb-client-gateway/dsb-client-gateway-iam-client';
import { SecretsEngineModule } from '@dsb-client-gateway/dsb-client-gateway-secrets-engine';
import { KeysModule } from './modules/keys/keys.module';
import { TopicModule } from './modules/topic/topic.module';
import { DidModule } from './modules/did/did.module';
import { StorageModule } from '../../../dsb-client-gateway-api/src/app/modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidate,
    }),
    StorageModule,
    DdhubClientGatewayUtilsModule,
    ScheduleModule.forRoot(),
    DdhubClientGatewayTracingModule.forRoot(),
    IamModule,
    DidModule,
    SecretsEngineModule,
    TopicModule,
    KeysModule,
  ],
  controllers: [],
  providers: [AppInitService],
})
export class AppModule {}
