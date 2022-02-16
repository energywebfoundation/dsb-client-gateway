import { Injectable } from '@nestjs/common';
import { EthersService } from '../../utils/ethers.service';
import { BalanceState } from '../../utils/balance.const';
import { NotEnoughBalanceException } from '../../identity/exceptions/not-enough-balance.exception';
import { IamService } from '../../iam-service/service/iam.service';
import { NatsListenerService } from './nats-listener.service';
import { Enrolment } from '../../storage/storage.interface';
import { StorageService } from '../../storage/service/storage.service';
import { NoPrivateKeyException } from '../../storage/exceptions/no-private-key.exception';

@Injectable()
export class EnrolmentService {
  constructor(
    protected readonly ethersService: EthersService,
    protected readonly iamService: IamService,
    protected readonly natsListenerService: NatsListenerService,
    protected readonly storageService: StorageService,
  ) {
  }

  public async getEnrolment(): Promise<Enrolment> {
    const enrolment = await this.storageService.getEnrolment();

    if(!enrolment) {
      await this.initEnrolment();
    }

    return this.storageService.getEnrolment();
  }

  public async initEnrolment(
  ): Promise<any> {
    const { address } = await this.storageService.getIdentity();
    const did = this.iamService.getDIDAddress();

    if (!address) {
      throw new NoPrivateKeyException();
    }

    const balance = await this.ethersService.getBalance(address);

    if (balance === BalanceState.NONE) {
      throw new NotEnoughBalanceException();
    }

    this.natsListenerService.init();
    this.natsListenerService.startListening();

    const state = await this.natsListenerService.getState();

    if (state.approved || state.waiting) {
      await this.storageService.writeEnrolment({
        state,
        did,
      });

      return {
        did,
        state,
      }
    }

    await this.natsListenerService.createClaim();

    const updatedState = await this.natsListenerService.getState();

    await this.storageService.writeEnrolment({
      did,
      state: updatedState,
    });

    return {
      did,
      state,
    }
  }
}
