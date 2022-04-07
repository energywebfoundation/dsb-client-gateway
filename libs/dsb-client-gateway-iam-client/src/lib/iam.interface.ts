import { IAppDefinition } from '@energyweb/iam-contracts';
import { ApiProperty } from '@nestjs/swagger';


export class ApplicationDTO implements IAppDefinition {
  @ApiProperty()
  appName: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  namespace?: string;
  topicsCount?: number;
}
