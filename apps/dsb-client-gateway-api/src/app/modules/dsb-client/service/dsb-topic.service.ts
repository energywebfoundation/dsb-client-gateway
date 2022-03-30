import { Injectable } from '@nestjs/common';
import { Agent } from 'https';
import { DsbApiService } from '../service/dsb-api.service';

@Injectable()
export class TopicService {
  constructor(protected readonly dsbClientService: DsbApiService) {}

  public async getApplications(roleName) {
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
