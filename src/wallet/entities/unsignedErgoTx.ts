import { TxId } from '../types';

import { DataInput } from './dataInput';
import { ErgoBox } from './ergoBox';
import { UnsignedInput } from './unsignedInput';

export type UnsignedErgoTx = {
  readonly id: TxId; // todo: remove when ergo-rust + yoroi-connector are updated.
  readonly inputs: UnsignedInput[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBox[]; // todo: replace with ErgoBoxCandidate[] when ergo-rust + yoroi-connector are updated.
};
