import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './modules/identity/identity.module';
import { EnrolmentModule } from './modules/enrolment/enrolment.module';
import { IamModule } from '@dsb-client-gateway/dsb-client-gateway-iam-client';
import { CertificateModule } from './modules/certificate/certificate.module';
import { MulterModule } from '@nestjs/platform-express';
import { KeysModule } from './modules/keys/keys.module';
import { SecretsEngineModule } from '@dsb-client-gateway/dsb-client-gateway-secrets-engine';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './modules/utils/filter/all-exceptions.filter';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './modules/health/health.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from './modules/utils/utils.module';
import { configValidate } from './modules/utils/config.validate';
import { ChannelModule } from './modules/channel/channel.module';
import { MessageModule } from './modules/message/message.module';
import { ApplicationModule } from './modules/application/application.module';
import { TopicModule } from './modules/topic/topic.module';
import { DdhubClientGatewayTracingModule } from '@dsb-client-gateway/ddhub-client-gateway-tracing';

@Module({})
export class AppModule {
  static register({ shouldValidate = true }: { shouldValidate: boolean }) {
    const imports = [
      ConfigModule.forRoot({
        isGlobal: true,
        validate: shouldValidate && configValidate,
      }),
      DdhubClientGatewayTracingModule.forRoot(),
      MulterModule.register({
        dest: './files',
      }),
      SecretsEngineModule,
      IamModule,
      IdentityModule,
      EnrolmentModule,
      CertificateModule,
      TerminusModule,
      ScheduleModule.forRoot(),
      UtilsModule,
      ChannelModule,
      MessageModule,
      KeysModule,
      ApplicationModule,
      TopicModule,
    ];

    const providers = [
      {
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
      },
      {
        provide: APP_PIPE,
        useClass: ValidationPipe,
      },
    ];
    const controllers = [HealthController];

    return {
      module: AppModule,
      imports,
      providers,
      controllers,
    };
  }
}
