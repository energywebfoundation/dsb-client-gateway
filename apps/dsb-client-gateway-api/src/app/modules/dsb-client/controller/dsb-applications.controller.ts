import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Patch,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { DsbApiService } from '../service/dsb-api.service';
import { IamService } from '../../../modules/iam-service/service/iam.service';
import { DigestGuard } from '../../utils/guards/digest.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationDTO } from '../dsb-client.interface';
import { GetApplicationsQueryDto } from '../dto';

@Controller('dsb')
@ApiTags('dsb')
@UseGuards(DigestGuard)
export class DsbApplicationsController {
  constructor(
    protected readonly dsbClientService: DsbApiService,
    protected readonly iamService: IamService
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
    const applications =
      await this.dsbClientService.getApplicationsByOwnerAndRole(roleName);

    const nameSpaces = await applications.map(
      (application) => application.namespace
    );

    const topicsCount = await this.dsbClientService.getTopicsCountByOwner(
      nameSpaces
    );
    const finalApllicationsResult = applications.map((application) => {
      application.topicsCount = topicsCount[application.namespace]
        ? topicsCount[application.namespace]
        : 0;
      return application;
    });
    return finalApllicationsResult;
  }
}
