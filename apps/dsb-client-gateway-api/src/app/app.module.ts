import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './modules/identity/identity.module';
import { EnrolmentModule } from './modules/enrolment/enrolment.module';
import { IamModule } from './modules/iam-service/iam.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { MulterModule } from '@nestjs/platform-express';
import { DsbClientModule } from './modules/dsb-client/dsb-client.module';
import { KeysModule } from './modules/keys/keys.module';
import { SecretsEngineModule } from './modules/secrets-engine/secrets-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './files',
    }),
    IamModule,
    IdentityModule,
    EnrolmentModule,
    CertificateModule,
    DsbClientModule,
    KeysModule,
    SecretsEngineModule,
  ],
})
export class AppModule {}
