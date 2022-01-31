import {
  Claim,
  ClaimsService,
  DidRegistry,
  initWithPrivateKeySigner,
  RegistrationTypes,
  setCacheConfig,
  SignerService
} from 'iam-client-lib'
import { config } from '../config'
import { CacheClient } from 'iam-client-lib/dist/src/modules/cacheClient'
import { PARENT_NAMESPACE } from '../utils'

export class IamService {
  constructor(
    private readonly cacheClient: CacheClient,
    private readonly claimsService: ClaimsService,
    private readonly didRegistry: DidRegistry,
    private readonly signerService: SignerService
  ) {}

  public static async initialize(
    privateKey: string,
    rpcUrl: string,
    chainId: number = config.iam.chainId
  ): Promise<IamService> {
    const { connectToCacheServer, signerService } = await initWithPrivateKeySigner(privateKey, rpcUrl)

    setCacheConfig(chainId, {
      url: config.iam.cacheServerUrl
    })

    await signerService.init()

    const { cacheClient, connectToDidRegistry } = await connectToCacheServer()

    const { claimsService, didRegistry } = await connectToDidRegistry()

    await didRegistry.init()
    await claimsService.init()

    return new IamService(cacheClient, claimsService, didRegistry, signerService)
  }

  public getClaimsByRequester(did: string, namespace: string = PARENT_NAMESPACE): Promise<Claim[]> {
    return this.cacheClient.getClaimsByRequester(did, {
      namespace
    })
  }

  public async decodeJWTToken(token: string): Promise<{ [key: string]: Claim }> {
    return (await this.didRegistry.decodeJWTToken({
      token
    })) as Promise<{ [key: string]: Claim }>
  }

  public async publishPublicClaim(token: string): Promise<void> {
    await this.claimsService.publishPublicClaim({
      token
    })
  }

  public async requestClaim(claim: string): Promise<void> {
    await this.claimsService.createClaimRequest({
      claim: {
        claimType: claim,
        claimTypeVersion: 1,
        fields: []
      },
      registrationTypes: [RegistrationTypes.OnChain, RegistrationTypes.OffChain]
    })
  }

  public getDid(did?: string, includeClaims = false) {
    return this.didRegistry.getDidDocument({
      did,
      includeClaims
    })
  }

  public getDIDAddress() {
    return this.signerService.did
  }
}
