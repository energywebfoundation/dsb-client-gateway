import * as crypto from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IamService } from '../../iam-service/service/iam.service';
import { SecretsEngineService } from '../../secrets-engine/secrets-engine.interface';
import HDKEY from 'hdkey';
import { DIDPublicKeyTags } from '../keys.const';
import moment from 'moment';
import { KeysRepository } from '../repository/keys.repository';
import { ec } from 'elliptic';
import BN from 'bn.js';

@Injectable()
export class KeysService implements OnModuleInit {
  private readonly logger = new Logger(KeysService.name);
  private readonly curve = 'secp256k1';
  private readonly symmetricAlgorithm = 'aes-256-cbc';
  private readonly hashAlgorithm = 'sha256';
  private readonly rsaPadding = crypto.constants.RSA_PKCS1_PADDING;

  constructor(
    protected readonly secretsEngineService: SecretsEngineService,
    protected readonly iamService: IamService,
    protected readonly keysRepository: KeysRepository
  ) {}

  public async storeKeysForMessage(
    messageId: string,
    senderDid: string,
    encryptedSymmetricKey: string
  ): Promise<void> {
    await this.keysRepository.storeKeys({
      messageId,
      encryptedSymmetricKey,
      senderDid,
    });
  }

  public computeSharedKey(
    privateKey: string,
    receiverPublicKey: string
  ): Buffer {
    const senderECDH = crypto.createECDH(this.curve);

    senderECDH.setPrivateKey(privateKey, 'hex');

    return senderECDH.computeSecret(receiverPublicKey, 'hex');
  }

  public encryptMessage(
    message: string | Buffer,
    computedSharedKey: Buffer,
    inputEncoding: 'binary' | 'utf-8'
  ): string {
    const iv: Buffer = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
      this.symmetricAlgorithm,
      computedSharedKey,
      iv
    );

    return (
      `${iv.toString('hex')}:` +
      cipher.update(message.toString('hex'), inputEncoding, 'hex') +
      cipher.final('hex')
    );
  }

  public createSignature(encryptedData: string, privateKey: Buffer): string {
    const EC = new ec(this.curve);

    const keyPair = EC.keyFromPrivate(privateKey);

    const { result, reason } = keyPair.validate();

    if (!result) {
      this.logger.log('Failed to create elliptic', reason);
    }

    const hash = crypto
      .createHash(this.hashAlgorithm)
      .update(encryptedData)
      .digest('hex');

    const signature = keyPair.sign(hash, 'hex', {
      canonical: true,
      pers: true,
    });

    return signature.r.toString(16, 64) + signature.s.toString(16, 64);
  }

  public verifySignature(
    senderPublicKey: Buffer,
    signature: string,
    encryptedData: string
  ): boolean {
    const EC = new ec(this.curve);

    const keyPair = EC.keyFromPublic(senderPublicKey);
    const hash = crypto
      .createHash(this.hashAlgorithm)
      .update(encryptedData)
      .digest('hex');

    const r = new BN(signature.slice(0, 64), 16).toString('hex');
    const s = new BN(signature.slice(64, 128), 16).toString('hex');

    return keyPair.verify(hash, { r, s });
  }

  public decryptMessage(
    message: string,
    receiverPrivateKey: string,
    senderPublicKey: string
  ): string {
    const [iv, encryptedData] = message.split(':');

    const receiver = crypto.createECDH(this.curve);
    receiver.setPrivateKey(receiverPrivateKey, 'hex');

    const computedSharedKey = receiver.computeSecret(senderPublicKey, 'hex');

    const receiverDecipher = crypto.createDecipheriv(
      this.symmetricAlgorithm,
      computedSharedKey,
      Buffer.from(iv, 'hex')
    );

    let decrypted = receiverDecipher.update(encryptedData, 'hex', 'utf-8');

    decrypted = decrypted + receiverDecipher.final('utf-8');

    return decrypted;
  }

  public async encryptSymmetricKey(
    symmetricKey: string,
    receiverDid: string
  ): Promise<string | null> {
    const did = await this.iamService.getDid(receiverDid);

    if (!did) {
      this.logger.error('IAM not initialized');

      return;
    }

    const key = did.publicKey.find(({ id }) => {
      return (
        id === `${receiverDid}#${DIDPublicKeyTags.DSB_SYMMETRIC_ENCRYPTION}`
      );
    });

    if (!key) {
      this.logger.error(
        `Receiver ${receiverDid} has no public key with ${DIDPublicKeyTags.DSB_SYMMETRIC_ENCRYPTION}`
      );

      return;
    }

    console.log(symmetricKey);

    const encryptedData = crypto.publicEncrypt(
      {
        key: key.publicKeyHex,
        padding: this.rsaPadding,
        // oaepHash: this.hashAlgorithm,
      },
      Buffer.from(symmetricKey)
    );

    return encryptedData.toString('base64');
  }

  public decryptSymmetricKey(
    privateKey: string,
    encryptedSymmetricKey: string,
    passphrase: string
  ): string {
    // const derivedPrivateKeyHash = crypto
    //   .createHash('sha256')
    //   .update(passphrase)
    //   .digest('hex');

    return crypto
      .publicDecrypt(
        {
          key: privateKey,
          padding: this.rsaPadding,
          // oaepHash: this.hashAlgorithm,
          passphrase: passphrase,
        },
        Buffer.from(encryptedSymmetricKey, 'base64')
      )
      .toString();
  }

  public getDerivedKey(rootKey: string): HDKEY {
    const currentDate: number = +moment().format('YYYYMMDD');

    const masterSeed = HDKEY.fromMasterSeed(Buffer.from(rootKey, 'hex'));

    return masterSeed.derive(`m/44' /246' /0' /${currentDate}`);
  }

  public async onModuleInit(): Promise<void> {
    const rootKey: string | null =
      await this.secretsEngineService.getPrivateKey();

    if (!rootKey) {
      this.logger.log('Not deriving RSA key due to missing private key');

      return;
    }

    const derivedKeyAtDay: HDKEY = this.getDerivedKey(rootKey);

    const { publicKey } = this.deriveRSAKey(
      derivedKeyAtDay.publicKey.toString('hex')
    );

    await this.iamService.setVerificationMethod(
      publicKey,
      DIDPublicKeyTags.DSB_SYMMETRIC_ENCRYPTION
    );
    console.log(await this.iamService.getDid());

    this.logger.log('Updated DID document with public key');
  }

  public deriveRSAKey(derivedKeyPrivateKey: string): {
    privateKey: string;
    publicKey: string;
  } {
    // const derivedPrivateKeyHash = crypto
    //   .createHash('sha256')
    //   .update(derivedKeyPrivateKey)
    //   .digest('hex');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        passphrase: derivedKeyPrivateKey,
      },
    });

    return { publicKey, privateKey };
  }
}
