import { Injectable, Logger } from '@nestjs/common';
import {
  CacheClient,
  Claim,
  ClaimsService,
  DIDAttribute,
  DidRegistry,
  RegistrationTypes,
  SignerService,
} from 'iam-client-lib';
import { IAppDefinition } from '@energyweb/iam-contracts';
import { IamFactoryService } from './iam-factory.service';
import { ConfigService } from '@nestjs/config';
import { Encoding } from '@ew-did-registry/did-resolver-interface';
import { KeyType } from '@ew-did-registry/keys';
import { ApplicationDTO } from '../iam.interface';

@Injectable()
export class IamService {
  private cacheClient: CacheClient;
  private claimsService: ClaimsService;
  private didRegistry: DidRegistry;
  private signerService: SignerService;
  private initialized = false;

  private readonly logger = new Logger(IamService.name);

  constructor(
    protected readonly iamFactoryService: IamFactoryService,
    protected readonly configService: ConfigService
  ) {}

  public getDidRegistry(): DidRegistry | undefined {
    return this.didRegistry;
  }

  public async getClaims(): Promise<Claim[]> {
    return this.cacheClient.getClaimsBySubject(this.getDIDAddress());
  }

  public async getUserClaimsFromDID() {
    return this.claimsService.getUserClaims();
  }

  public async setVerificationMethod(
    publicKey: string,
    tag = 'dsb'
  ): Promise<void> {
    await this.didRegistry.updateDocument({
      did: this.getDIDAddress(),
      didAttribute: DIDAttribute.PublicKey,
      data: {
        type: DIDAttribute.PublicKey,
        encoding: Encoding.HEX,
        algo: KeyType.RSA,
        value: {
          type: KeyType.RSA,
          tag,
          publicKey,
        },
      },
    });
  }

  public async getEnrolledDids(roleName: string): Promise<string[]> {
    return this.cacheClient.getDIDsForRole(roleName);
  }

  public async setup(privateKey: string) {
    this.logger.log('Initializing IAM connection');

    const { cacheClient, didRegistry, signerService, claimsService } =
      await this.iamFactoryService.initialize(privateKey, this.configService);

    this.cacheClient = cacheClient;
    this.didRegistry = didRegistry;
    this.signerService = signerService;
    this.claimsService = claimsService;

    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getClaimById(id: string): Promise<Claim> {
    return this.claimsService.getClaimById(id);
  }

  public async getApplicationsByOwnerAndRole(
    roleName: string,
    ownerDid: string
  ): Promise<ApplicationDTO[]> {
    this.logger.debug('start: ApplicationsByOwnerAndRole');

    const didClaims = await this.cacheClient.getClaimsByRequester(ownerDid, {
      isAccepted: true,
    });
    const namespaceList = [];
    const applications: IAppDefinition[] = [];

    didClaims.forEach((didClaim) => {
      if (
        didClaim.claimType.startsWith(`${roleName}.`) &&
        didClaim.namespace !== this.configService.get('DID_CLAIM_NAMESPACE')
      ) {
        namespaceList.push(didClaim.namespace);
      }
    });

    await Promise.all(
      namespaceList.map(async (namespace: string) => {
        const application = (await this.cacheClient.getAppDefinition(
          namespace
        )) as ApplicationDTO;
        application.namespace = namespace;
        applications.push(application);
      })
    );

    const uniqueApplications = [...new Set(applications)];

    this.logger.debug('end: ApplicationsByOwnerAndRole');

    return uniqueApplications;
  }

  public getClaimsByRequester(
    did: string,
    namespace: string
  ): Promise<Claim[]> {
    return this.cacheClient.getClaimsByRequester(did, {
      namespace,
    });
  }

  public async decodeJWTToken(
    token: string
  ): Promise<{ [key: string]: Claim }> {
    return (await this.didRegistry.decodeJWTToken({
      token,
    })) as Promise<{ [key: string]: Claim }>;
  }

  public async publishPublicClaim(token: string): Promise<void> {
    await this.claimsService.publishPublicClaim({
      token,
    });
  }

  public async requestClaim(claim: string): Promise<void> {
    const claimObject = {
      claim: {
        claimType: claim,
        claimTypeVersion: 1,
        fields: [],
      },
      registrationTypes: [
        RegistrationTypes.OnChain,
        RegistrationTypes.OffChain,
      ],
    };

    this.logger.log('Requesting claim', claimObject);

    await this.claimsService.createClaimRequest(claimObject);
  }

  public getDid(did?: string, includeClaims = false) {
    return this.didRegistry.getDidDocument({
      did,
      includeClaims,
    });
  }

  public getDIDAddress(): string | null {
    if (!this.signerService) {
      return null;
    }

    return this.signerService.did;
  }
}

/**
 *
 * can you get list of DIDs based on role/roles - ask Jakub
 */
