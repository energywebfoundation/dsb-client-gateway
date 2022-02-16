import { Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CertificateService } from './service/certificate.service';
import { CertificateFiles } from '../storage/storage.interface';
import { StorageService } from '../storage/service/storage.service';

@Controller('certificate')
export class CertificateController {
  constructor(
    protected readonly certificateService: CertificateService,
  ) {
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'certificate',
      maxCount: 1,
    },
    {
      name: 'privateKey',
      maxCount: 1,
    },
    {
      name: 'caCertificate',
      maxCount: 1,
    }
  ]))
  public async save(
    @UploadedFiles() { certificate, privateKey, caCertificate }: { certificate, privateKey, caCertificate }
  ): Promise<void> {

    await this.certificateService.save(certificate[0], privateKey[0], caCertificate);
  }
}
