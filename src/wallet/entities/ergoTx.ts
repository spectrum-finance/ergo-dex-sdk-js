import { TxId } from '../types';

import { DataInput } from './dataInput';
import { ErgoBox } from './ergoBox';
import { Input } from './input';

export type ErgoTx = {
  readonly id: TxId;
  readonly inputs: Input[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBox[];
  readonly size: number;
};
