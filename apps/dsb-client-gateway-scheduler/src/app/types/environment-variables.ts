import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SecretsEngine } from '@dsb-client-gateway/dsb-client-gateway-secrets-engine';

export enum NODE_ENV {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

export enum OpenTelemetryExporters {
  ZIPKIN = 'ZIPKIN',
}

export class EnvironmentVariables {
  @IsString()
  @IsEnum(NODE_ENV)
  NODE_ENV: NODE_ENV;

  @IsString()
  RPC_URL = 'https://volta-rpc.energyweb.org/';

  @IsString()
  DSB_BASE_URL = 'https://dsb-demo.energyweb.org';

  @IsString()
  CLIENT_ID = 'WS_CONSUMER';

  @IsPositive()
  EVENTS_MAX_PER_SECOND = 2;

  @IsString()
  PARENT_NAMESPACE = 'dsb.apps.energyweb.iam.ewc';

  @IsString()
  EVENT_SERVER_URL = 'identityevents-dev.energyweb.org';

  @IsString()
  NATS_ENV_NAME = 'ewf-dev';

  @IsPositive()
  @Transform(EnvironmentVariables.transformNumber('CHAIN_ID'))
  CHAIN_ID = 73799;

  @IsString()
  CACHE_SERVER_URL = 'https://identitycache-dev.energyweb.org/v1';

  @IsString()
  CLAIM_MANAGER_ADDRESS = '0x5339adE9332A604A1c957B9bC1C6eee0Bcf7a031';

  @IsEnum(SecretsEngine)
  SECRETS_ENGINE = SecretsEngine.VAULT;

  @IsString()
  @ValidateIf(EnvironmentVariables.isVaultEnabled)
  VAULT_ENDPOINT;

  @IsString()
  @ValidateIf(EnvironmentVariables.isVaultEnabled)
  VAULT_TOKEN = 'root';

  @IsString()
  DID_AUTH_URL = 'http://localhost:8080';

  @IsPositive()
  @IsOptional()
  MAX_RETRIES = 3;

  @IsPositive()
  @IsOptional()
  RETRY_FACTOR = 2;

  @IsPositive()
  @IsOptional()
  TIMEOUT = 1000;

  @IsBoolean()
  @Transform(EnvironmentVariables.transformBoolean('OPENTELEMETRY_ENABLED'))
  OPENTELEMETRY_ENABLED = false;

  @IsEnum(OpenTelemetryExporters)
  @ValidateIf(EnvironmentVariables.isOTELEnabled)
  OPEN_TELEMETRY_EXPORTER = OpenTelemetryExporters.ZIPKIN;

  @IsString()
  @ValidateIf(EnvironmentVariables.isOTELEnabled)
  OTEL_IGNORED_ROUTES = 'health,api/v2/health';

  @IsString()
  @ValidateIf(EnvironmentVariables.isOTELEnabled)
  OTEL_TRACING_URL = 'http://localhost:4318/v1/traces';

  @IsString()
  @ValidateIf(EnvironmentVariables.isOTELEnabled)
  OTEL_SERVICE_NAME = 'ddhub-client-gateway';

  @IsString()
  @ValidateIf(EnvironmentVariables.isOTELEnabled)
  OTEL_ENVIRONMENT = 'local';

  @IsString()
  DB_NAME = 'local.db';

  static isOTELEnabled(values: EnvironmentVariables): boolean {
    return values.OPENTELEMETRY_ENABLED;
  }

  static transformNumber(
    paramKey: string
  ): ({ obj }: { obj: EnvironmentVariables }) => number {
    return ({ obj }) => {
      return +obj[paramKey];
    };
  }

  static isVaultEnabled(values: EnvironmentVariables): boolean {
    return values.SECRETS_ENGINE === SecretsEngine.VAULT;
  }

  static transformBoolean(
    paramKey: string
  ): ({ obj }: { obj: EnvironmentVariables }) => boolean {
    return ({ obj }) => {
      return [true, 'true'].indexOf(obj[paramKey]) > -1;
    };
  }
}
