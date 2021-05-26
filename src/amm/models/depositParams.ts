import { AssetInfo, PublicKey } from '../../wallet';
import { PoolId } from '../types';

export type DepositParams = {
  readonly poolId: PoolId;
  readonly x: AssetInfo;
  readonly y: AssetInfo;
  readonly pk: PublicKey;
  readonly dexFee: bigint;
};
