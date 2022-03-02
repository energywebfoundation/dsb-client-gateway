import * as crypto from "crypto";
import {generateMnemonic, mnemonicToSeedSync} from 'bip39';

import HDKEY from 'hdkey';
import {ec} from 'elliptic';
import  BN from 'bn.js';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IamService } from '../../iam-service/service/iam.service';
import moment from 'moment';
import { SecretsEngineService } from '../../secrets-engine/secrets-engine.interface';

@Injectable()
export class KeysService implements OnModuleInit {
  private readonly logger = new Logger(KeysService.name);

  constructor(
    protected readonly secretsEngineService: SecretsEngineService,
    protected readonly iamService: IamService
  ) {
  }

  public async onModuleInit(): Promise<void> {
    await this.generateMasterHDKey();
  }

  public async generateMasterHDKey(): Promise<void> {
    if (!this.iamService.getDIDAddress()) {
      this.logger.warn('Skipping keys as IAM is not initialized');

      return;
    }

    const currentKeys = await this.secretsEngineService.getEncryptionKeys();

    if (currentKeys) {
      this.logger.log('Master keys already exists');

      await this.deriveKeys();

      return;
    }

    this.logger.log('Generating master BIP32 keys');

    const mnemonic = generateMnemonic();

    const seed = mnemonicToSeedSync(mnemonic);

    const { privateKey, publicKey } = HDKEY.fromMasterSeed(seed);

    await this.secretsEngineService.setEncryptionKeys({
      privateMasterKey: privateKey.toString('hex'),
      publicMasterKey: publicKey.toString('hex'),
      createdAt: moment().format('YYYYMMDD'),
      privateDerivedKey: null,
    });

    await this.deriveKeys();
  }

  public async deriveKeys() {
    this.logger.log('Deriving keys');

    const keys = await this.secretsEngineService.getEncryptionKeys();

    if(!keys) {
      this.logger.log('No secrets found');

      return;
    }

    const { createdAt, privateMasterKey, publicMasterKey } = keys;

    const masterSeed = HDKEY.fromMasterSeed(Buffer.from(privateMasterKey, 'hex'));

    const iteration = moment().diff(createdAt, 'days');

    this.logger.log(`KDF iteration ${iteration}`);

    const { privateKey, publicKey } = masterSeed.derive(`m/44' /246' /0' /${iteration}`)

    await this.iamService.setVerificationMethod(publicKey.toString('hex'));

    await this.secretsEngineService.setEncryptionKeys({
      createdAt,
      privateDerivedKey: privateKey.toString('hex'),
      publicMasterKey,
      privateMasterKey
    });
  }
}
