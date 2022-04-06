import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { DsbApiService } from '../service/dsb-api.service';
import {
  ApplicationDTO,
  IamService,
} from '@dsb-client-gateway/dsb-client-gateway-iam-client';
import { DigestGuard } from '../../utils/guards/digest.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetApplicationsQueryDto } from '../dto';
import { TopicService } from '../service/dsb-topic.service';

@Controller('dsb')
@ApiTags('dsb')
@UseGuards(DigestGuard)
@ApiTags('dsb')
export class DsbApplicationsController {
  constructor(
    protected readonly dsbClientService: DsbApiService,
    protected readonly iamService: IamService,
    protected readonly topicService: TopicService
  ) {}

  @Get('applications')
  @ApiOperation({
    description: 'Gets Applications',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApplicationDTO,
    description: 'List of applications',
  })
  public async getApplications(@Query() { roleName }: GetApplicationsQueryDto) {
    return this.topicService.getApplications(roleName);
  }
}
