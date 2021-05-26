import { Address } from '../entities/address';
import { BoxSelection } from '../entities/boxSelection';

import { NetworkContext } from './networkContext';

export class TransactionContext {
  readonly inputs: BoxSelection;
  readonly changeAddress: Address;
  readonly feeNErgs: bigint;
  readonly network: NetworkContext;

  constructor(
    inputs: BoxSelection,
    changeAddress: Address,
    feeNErgs: bigint,
    networkCtx: NetworkContext
  ) {
    this.inputs = inputs;
    this.changeAddress = changeAddress;
    this.feeNErgs = feeNErgs;
    this.network = networkCtx;
  }
}
