import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Agent } from 'https';
import { TlsAgentService } from './tls-agent.service';
import { EthersService } from '../../utils/ethers.service';
import { StorageService } from '../../storage/service/storage.service';
import { IamService } from '../../iam-service/service/iam.service';
import { lastValueFrom } from 'rxjs';
import { Channel } from '../dsb-client.interface';
import { SecretsEngineService } from '../../secrets-engine/secrets-engine.interface';

@Injectable()
export class DsbApiService {
  private readonly logger = new Logger(DsbApiService.name);

  protected tls: Agent | null;
  protected authToken?: string;
  protected baseUrl: string;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly httpService: HttpService,
    protected readonly tlsAgentService: TlsAgentService,
    protected readonly ethersService: EthersService,
    protected readonly storageService: StorageService,
    protected readonly iamService: IamService,
    protected readonly secretsEngineService: SecretsEngineService
  ) {
    this.baseUrl = this.configService.get<string>('DSB_BASE_URL', 'https://dsb-dev.energyweb.org');
  }

  public async getChannels(): Promise<Channel[]> {
    await this.enableTLS();

    if (!this.authToken) {
      await this.login();
    }

    const res = await lastValueFrom(this.httpService.get(this.baseUrl + '/channel/pubsub', {
      httpsAgent: this.getTLS(),
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    }))
      .then(({ data }) => data)
      .catch((err) => {
        return this.retry(err, this.getChannels);
      });

    return res;
  }

  private async retry<T>(
    err: any,
    retryFn: () => Promise<T>
  ): Promise<T> {
    this.logger.error(err.message);
    this.logger.error(err.response.data);

    if (err.response.status === 401) {
      await this.login();
    }

    if (err.response.status === 403) {
      throw err;
    }

    const bounded = retryFn.bind(this);

    return bounded();
  }

  public async login(): Promise<void> {
    await this.enableTLS();
    this.logger.log('Attempting to login');

    const privateKey = await this.secretsEngineService.getPrivateKey();

    const proof = await this.ethersService.createProof(
      privateKey,
      this.iamService.getDIDAddress()
    );

    const res = await lastValueFrom(this.httpService.post(this.baseUrl + '/auth/login', {
      identityToken: proof
    }, {
      httpsAgent: this.getTLS()
    })).catch((e) => {
      this.logger.error('Login failed');

      this.logger.error(e.message);
      this.logger.error(e.response.data);

      throw e;
    });

    this.logger.log('Login successful');

    this.authToken = res.data.token;
  }

  public async health(): Promise<{ statusCode: number, message?: string }> {
    await this.enableTLS();

    try {
      await this.httpService.get('/health', {
        httpsAgent: this.getTLS()
      });

      return { statusCode: 200 };
    } catch (e) {
      if (e.response) {
        this.logger.error(`DSB Health failed - ${e.response.data}`);
      }

      return {
        statusCode: e.response.status,
        message: e.response.data
      };
    }
  }

  protected getTLS(): Agent | null {
    return this.tls;
  }

  protected async enableTLS(): Promise<void> {
    this.tls = await this.tlsAgentService.create();
  }

  protected disableTLS(): void {
    this.tls.destroy();

    this.tls = null;
  }
}
