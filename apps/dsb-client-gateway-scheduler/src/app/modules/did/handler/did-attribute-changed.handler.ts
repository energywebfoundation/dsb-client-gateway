import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DidAttributeChangedCommand } from '../../../../../../../libs/dsb-client-gateway-did-registry/src/lib/command/did-attribute-changed.command';
import { DidRepository } from '../../../../../../../libs/dsb-client-gateway-storage/src/lib/repository/did.repository';
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
