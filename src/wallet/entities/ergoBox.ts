import { BoxId, TxId } from '../types';

import { ErgoTree } from './ergoTree';
import { Registers } from './registers';
import { TokenAmount } from './tokenAmount';

export type ErgoBox = {
  readonly boxId: BoxId;
  readonly transactionId: TxId;
  readonly index: number;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly value: bigint;
  readonly assets: TokenAmount[];
  readonly additionalRegisters: Registers;
};
