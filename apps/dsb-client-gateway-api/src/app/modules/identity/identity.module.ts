import { Module } from '@nestjs/common';
import { UtilsModule } from '../utils/utils.module';
import { IdentityService } from './service/identity.service';
import { IdentityController } from './identity.controller';
import { StorageModule } from '../storage/storage.module';
import { EnrolmentModule } from '../enrolment/enrolment.module';
import { SecretsEngineModule } from '@dsb-client-gateway/dsb-client-gateway-secrets-engine';

@Module({
  imports: [UtilsModule, StorageModule, SecretsEngineModule, EnrolmentModule],
  providers: [IdentityService],
  controllers: [IdentityController],
  exports: [IdentityService],
})
export class IdentityModule {}
