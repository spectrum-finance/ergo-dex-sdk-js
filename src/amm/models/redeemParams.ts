import { AssetInfo, PublicKey } from '../../wallet';
import { PoolId } from '../types';

export type RedeemParams = {
  readonly poolId: PoolId;
  readonly pk: PublicKey;
  readonly lp: AssetInfo;
  readonly dexFee: bigint;
};
