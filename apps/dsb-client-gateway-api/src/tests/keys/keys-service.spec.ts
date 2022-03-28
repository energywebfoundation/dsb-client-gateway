import { KeysService } from '../../app/modules/keys/service/keys.service';
import { SecretsEngineService } from '../../app/modules/secrets-engine/secrets-engine.interface';
import { IamService } from '../../app/modules/iam-service/service/iam.service';
import { KeysRepository } from '../../app/modules/keys/repository/keys.repository';
import { Wallet } from 'ethers';

const secretsEngineServiceMock = {
  getPrivateKey: jest.fn(),
<<<<<<< HEAD
=======
  getRSAPrivateKey: jest.fn().mockImplementation(async () => 'key'),
  setRSAPrivateKey: jest.fn(),
>>>>>>> f5e33543b7fc2f0362332bd26d06b0cd3c640727
};

const iamServiceMock = {
  getDid: jest.fn(),
  setVerificationMethod: jest.fn(),
};

const keysRepositoryMock = {
  storeKeys: jest.fn(),
};

const mockDid = {
  '@context': 'https://www.w3.org/ns/did/v1',
  authentication: [
    {
      type: 'owner',
      validity: [Object],
      publicKey:
        'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993#owner',
    },
  ],
  created: null,
  delegates: null,
  id: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
  service: [
    {
      id: 'b9613035-2d21-41db-8060-a3c5de0ed557',
      did: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
      iss: 'did:ethr:volta:0x7dD4cF86e6f143300C4550220c4eD66690a655fc',
      sub: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
      hash: '04a68efe006d745fc60328f0cb58b240c42ee90719b5bc10bb60df1f30eacabe',
      signer: 'did:ethr:volta:0x7dD4cF86e6f143300C4550220c4eD66690a655fc',
      hashAlg: 'SHA256',
      claimType: 'user.roles.ddhub.apps.energyweb.iam.ewc',
      issuerFields: [],
      requestorFields: [],
      serviceEndpoint: 'QmaKz3Mob9HdvKQfu5Q1MZTb9CcxG9NLi9Yh2dQUXytr8N',
      claimTypeVersion: 1,
    },
  ],
  publicKey: [
    {
      id: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993#dsb',
      type: 'Secp256k1pub',
      controller: '0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
      publicKeyHex:
        '035b8e0d54d389b05c8f0a4f03d6b5015fe55c39aab50d9cfe2da07da59d141f91',
    },
<<<<<<< HEAD
    {
      id: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993#dsb-symmetric-encryption',
      type: 'Rsapub',
      controller: '0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
      publicKeyHex:
        '-----BEGIN PUBLIC KEY-----\n' +
        'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAq5zzKRwtGQjtgx8sL3vx\n' +
        'GeKB5k6qlCHNosKjHfu7VcAeIq9XIOWAN7sa42V94t4q5x21CyMaSPd65A+VRpDG\n' +
        'C5HxYk+fa3rEvnmj+zAAUk3S49WKpo3wOvzCKF7IuF5yAnE4TpX3w9Qq4Ty8P1Ya\n' +
        'DLEHCvHwfpQ/IY+DG3yDX+qzh82NQSTVCUBZYVytMFNKxpR2NuXadaEoDoK5bsbh\n' +
        'tvxVoa0uns4kdhR9UtfnuW7Bd6o7BYKzxoP8q8ukeRFfJ7BPz3ysYx5SueAB/QXN\n' +
        'wN1IpbUZ7giaVmTgYHRWIIQ3wMWHgZv45x/6cWYTBBnLBT37BySABgPTIQwVV53c\n' +
        'xDw7OEuS7eqNHg4IUw4kwPZ5BBs/RePC6cWIfqn72RMjRhgCfhmV6XmEHEk61u24\n' +
        'DDEI/miNBXFcOOlcZx7CygN8rj8a04aCvz3f/XzkaDIk4SLz/YFS1AQEglkDlw3s\n' +
        '81PiWag4bqZNJ1gfLDeUtRFuF0DjJmmFY5mcL8HqeKFLomunba+BWYBtWnrFxYGF\n' +
        'CVjqKHE1eH1SWn06VW830kcNDWQzz1S8x94o21MJQZVFzREQdsZ5OEeATyr8vrAj\n' +
        'E56+8PbYciLJG9Py1AfqzCrSgTOdfQQJ5lbiaynU4tWBIgg7TDUY+LWVMPFH/cxn\n' +
        '740/gLWEKRDhxe9yk1FkJvUCAwEAAQ==\n' +
        '-----END PUBLIC KEY-----\n',
    },
=======
    ,
>>>>>>> f5e33543b7fc2f0362332bd26d06b0cd3c640727
  ],
  proof: null,
  updated: null,
};
describe('KeysService (SPEC)', () => {
  let keysService: KeysService;

  beforeEach(() => {
    jest.clearAllMocks();

    keysService = new KeysService(
      secretsEngineServiceMock as unknown as SecretsEngineService,
      iamServiceMock as unknown as IamService,
      keysRepositoryMock as unknown as KeysRepository
    );
  });

  describe('encryptSymmetricKey and decryptSymmetricKey', () => {
    it('should encrypt symmetric key', async () => {
<<<<<<< HEAD
      const symmetricKey = 'RANDOM';

      const { privateKey, publicKey } = keysService.deriveRSAKey('KEY');

      mockDid.publicKey[0].publicKeyHex = publicKey;

      iamServiceMock.getDid = jest.fn().mockImplementation(async () => mockDid);
=======
      const genRandomString = () =>
        (Math.random() + 1).toString(36).substring(7);

      const rsaPassword = genRandomString();
      const symmetricKey = genRandomString();

      const { privateKey, publicKey } = keysService.deriveRSAKey(rsaPassword);

      iamServiceMock.getDid = jest.fn().mockImplementation(async () => ({
        ...mockDid,
        publicKey: [
          {
            id: 'did:ethr:volta:0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993#dsb-symmetric-encryption',
            type: 'Rsapub',
            controller: '0x09Df5d33f1242E1b8aA5E0E0F6BfA687E6846993',
            publicKeyHex: publicKey,
          },
        ],
      }));
>>>>>>> f5e33543b7fc2f0362332bd26d06b0cd3c640727

      const encryptedSymmetricKey = await keysService.encryptSymmetricKey(
        symmetricKey,
        mockDid.id
      );

<<<<<<< HEAD
      console.log(Buffer.from(encryptedSymmetricKey).byteLength);

      const decryptedSymmetricKey = keysService.decryptSymmetricKey(
        privateKey,
        encryptedSymmetricKey,
        'KEY'
      );

      console.log(decryptedSymmetricKey);
    });
  });

  describe('deriveRSAKey', () => {
    it('should create RSA Key', () => {
      // This test actually checks if there is no collision between keys
      const randomPrivateKey: string = Wallet.createRandom().privateKey;

      secretsEngineServiceMock.getPrivateKey = jest
        .fn()
        .mockImplementation(async () => randomPrivateKey);

      const derivedKey = keysService.getDerivedKey(randomPrivateKey);

      const firstKey = keysService.deriveRSAKey(
        derivedKey.privateKey.toString('hex')
      );

      const derivedSameKey = keysService.getDerivedKey(randomPrivateKey);

      const secondKey = keysService.deriveRSAKey(
        derivedSameKey.privateKey.toString('hex')
      );

      expect(firstKey).toEqual(secondKey);
=======
      const decryptedSymmetricKey = keysService.decryptSymmetricKey(
        privateKey,
        encryptedSymmetricKey,
        rsaPassword
      );

      expect(symmetricKey).toEqual(decryptedSymmetricKey);
>>>>>>> f5e33543b7fc2f0362332bd26d06b0cd3c640727
    });
  });

  describe('encryption flow', () => {
    it('encryption flow', () => {
      const { privateKey: senderPrivateKey } = Wallet.createRandom();

      const { privateKey: receiverPrivateKey } = Wallet.createRandom();

      const dataToEncrypt = JSON.stringify({
        EWT_PRICE: 100,
      });

      const [senderDerivedKey, receiverDerivedKey] = [
        keysService.getDerivedKey(receiverPrivateKey),
        keysService.getDerivedKey(senderPrivateKey),
      ];

      const sharedKey = keysService.computeSharedKey(
        senderDerivedKey.privateKey.toString('hex'),
        receiverDerivedKey.publicKey.toString('hex')
      );

      const encryptedMessage = keysService.encryptMessage(
        dataToEncrypt,
        sharedKey,
        'utf-8'
      );

      const signature = keysService.createSignature(
        encryptedMessage,
        senderDerivedKey.privateKey
      );

      const isSignatureValid = keysService.verifySignature(
        senderDerivedKey.publicKey, // This should be coming from encrypted RSA public key
        signature,
        encryptedMessage
      );

      expect(isSignatureValid).toBe(true);

      const decryptedMessage = keysService.decryptMessage(
        encryptedMessage,
        receiverDerivedKey.privateKey.toString('hex'),
        senderDerivedKey.publicKey.toString('hex')
      );

      expect(dataToEncrypt).toEqual(decryptedMessage);
    });
  });

  describe('getDerivedKey', () => {
    it('should derive key', async () => {
      const randomPrivateKey: string = Wallet.createRandom().privateKey;

      const hdkey = await keysService.getDerivedKey(randomPrivateKey);

      expect(hdkey).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('should not execute - no root key is set', async () => {
      secretsEngineServiceMock.getPrivateKey = jest
        .fn()
        .mockImplementation(async () => null);

      await keysService.onModuleInit();

      expect(iamServiceMock.setVerificationMethod).toBeCalledTimes(0);
    });

    it('should derive keys', async () => {
      const randomPrivateKey: string = Wallet.createRandom().privateKey;

      secretsEngineServiceMock.getPrivateKey = jest
        .fn()
        .mockImplementation(async () => randomPrivateKey);

<<<<<<< HEAD
=======
      secretsEngineServiceMock.getRSAPrivateKey = jest
        .fn()
        .mockImplementation(async () => null);

>>>>>>> f5e33543b7fc2f0362332bd26d06b0cd3c640727
      await keysService.onModuleInit();

      expect(iamServiceMock.setVerificationMethod).toBeCalledTimes(1);
    });
  });
});
