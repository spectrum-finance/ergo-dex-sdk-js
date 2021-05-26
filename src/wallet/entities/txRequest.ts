import { Address } from './address';
import { BoxSelection } from './boxSelection';
import { DataInput } from './dataInput';
import { ErgoBoxCandidate } from './ergoBoxCandidate';

export type TxRequest = {
  readonly inputs: BoxSelection;
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxCandidate[];
  readonly changeAddress: Address;
  readonly feeNErgs: bigint;
};
