import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DidAttributeChangedCommand } from '@dsb-client-gateway/dsb-client-gateway-did-registry';
import { DidRepository } from '@dsb-client-gateway/dsb-client-gateway-storage';
import { IamService } from '@dsb-client-gateway/dsb-client-gateway-iam-client';
import { Logger } from '@nestjs/common';

@CommandHandler(DidAttributeChangedCommand)
export class DidAttributeChangedHandler
  implements ICommandHandler<DidAttributeChangedCommand>
{
  private readonly logger = new Logger(DidAttributeChangedHandler.name);

  constructor(
    protected readonly didRepository: DidRepository,
    protected readonly iamService: IamService
  ) {}

  public async execute({ did }: DidAttributeChangedCommand): Promise<void> {
    const didDocument = await this.iamService.getDid(did);

    const rsaPublicKey = didDocument.publicKey.find(
      ({ id }) => id === `${did}#dsb-symmetric-encryption`
    );
    const publicSignatureKey = didDocument.publicKey.find(
      ({ id }) => id === `${did}#dsb-signature-key`
    );

    if (!publicSignatureKey || !rsaPublicKey) {
      this.logger.error(
        `${did} does not have #dsb-symmetric-encryption or #dsb-signature-key, not storing`
      );

      this.logger.debug(didDocument);

      return;
    }

    await this.didRepository.upsertDid(
      did,
      rsaPublicKey.publicKeyHex,
      publicSignatureKey.publicKeyHex
    );

    this.logger.log(`Updated ${did}`);
  }
}
