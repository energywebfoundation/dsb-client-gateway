import { Controller, Get, Post } from '@nestjs/common';
import { EnrolmentService } from './service/enrolment.service';
import { Enrolment } from '../storage/storage.interface';

@Controller('enrol')
export class EnrolmentController {
  constructor(
    protected readonly enrolmentService: EnrolmentService,
  ) {
  }

  @Get('')
  public async get(): Promise<Enrolment> {
    return this.enrolmentService.getEnrolment();
  }

  @Post('')
  public async init() {
    return this.enrolmentService.initEnrolment();
  }
}
