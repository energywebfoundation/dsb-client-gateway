import { Injectable, Logger } from '@nestjs/common';
import { DdhubBaseService } from './ddhub-base.service';
import { HttpService } from '@nestjs/axios';
import { RetryConfigService } from '@dsb-client-gateway/ddhub-client-gateway-utils';
import { DidAuthService } from '@dsb-client-gateway/ddhub-client-gateway-did-auth';
import { TlsAgentService } from './tls-agent.service';
import { Span } from 'nestjs-otel';
import FormData from 'form-data';
import { DdhubLoginService } from './ddhub-login.service';
import 'multer';
import { SendMessageResponseFile } from '../dto';

@Injectable()
export class DdhubFilesService extends DdhubBaseService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly retryConfigService: RetryConfigService,
    protected readonly didAuthService: DidAuthService,
    protected readonly tlsAgentService: TlsAgentService,
    protected readonly ddhubLoginService: DdhubLoginService
  ) {
    super(
      new Logger(DdhubFilesService.name),
      retryConfigService,
      ddhubLoginService
    );
  }

  @Span('ddhub_mb_uploadFile')
  public async uploadFile(
    file: Express.Multer.File,
    fqcns: string[],
    topicId: string,
    topicVersion: string,
    signature: string,
    encryptedMessage: string,
    clientGatewayMessageId: string,
    transactionId?: string
  ): Promise<SendMessageResponseFile> {
    this.logger.log('Uploading File');
    try {
      const formData = new FormData();

      formData.append('file', encryptedMessage);
      formData.append('fileName', file.originalname);
      formData.append('fqcns', fqcns.join(','));
      formData.append('signature', signature);
      formData.append('topicId', topicId);
      formData.append('topicVersion', topicVersion);
      formData.append('clientGatewayMessageId', clientGatewayMessageId);

      if (transactionId) {
        formData.append('transactionId', transactionId);
      }

      await this.tlsAgentService.checkTLSEnabled();

      const result = await this.request<null>(
        () =>
          this.httpService.post('/messages/upload', formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpsAgent: this.tlsAgentService.get(),
            headers: {
              Authorization: `Bearer ${this.didAuthService.getToken()}`,
              ...formData.getHeaders(),
            },
          }),
        {
          stopOnResponseCodes: ['10'],
        }
      );

      this.logger.log(
        `upload file with file name: ${file.originalname} successful`
      );
      return result.data;
    } catch (e) {
      this.logger.error(
        `upload file with file name: ${file.originalname} failed`,
        e
      );
      throw e;
    }
  }

  @Span('ddhub_mb_downloadFile')
  public async downloadFile(
    fileId: string
  ): Promise<{ data: string; headers: any }> {
    try {
      await this.tlsAgentService.checkTLSEnabled();
      const result = await this.request<null>(
        () =>
          this.httpService.get('/messages/download', {
            params: {
              fileId,
            },
            httpsAgent: this.tlsAgentService.get(),
            headers: {
              Authorization: `Bearer ${this.didAuthService.getToken()}`,
            },
          }),
        {
          stopOnResponseCodes: ['10'],
        }
      );

      this.logger.log(
        `download file with fileId: ${fileId} successful from MB`
      );
      return result;
    } catch (e) {
      this.logger.error(
        `download file with fileId: ${fileId} failed from MB`,
        e
      );
      throw e;
    }
  }
}
