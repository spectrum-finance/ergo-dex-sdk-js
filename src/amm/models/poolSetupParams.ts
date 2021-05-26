import { sqrt } from '../../utils/sqrt';
import { AssetAmount, PublicKey } from '../../wallet';
import {
  MinPoolNanoErgs,
  PoolFeeMaxDecimals,
  PoolFeeScale,
} from '../constants';
import { InvalidParams } from '../errors/invalidParams';

export type PoolSetupParams = {
  readonly x: AssetAmount;
  readonly y: AssetAmount;
  readonly feeNumerator: number;
  readonly lockNanoErgs: bigint;
  readonly outputShare: bigint;
  readonly initiatorPk: PublicKey;
};

export function make(
  x: AssetAmount,
  y: AssetAmount,
  fee: number,
  lockNanoErgs: bigint,
  initiatorPk: PublicKey
): PoolSetupParams | InvalidParams {
  const invalidPair =
    x.asset === y.asset
      ? [{ param: 'x|y', error: 'x|y must contain different tokens' }]
      : [];
  const invalidFeeRange =
    fee > 1 && fee < 0
      ? [{ param: 'fee', error: 'Fee must be in range [0, 1]' }]
      : [];
  const invalidFeeResolution =
    fee.toString().split('.')[1].length > PoolFeeMaxDecimals
      ? [
          {
            param: 'fee',
            error: `Fee must have <= ${PoolFeeMaxDecimals} decimals`,
          },
        ]
      : [];
  const invalidErgsAmount =
    lockNanoErgs < MinPoolNanoErgs
      ? [
          {
            param: 'lockNanoErgs',
            error: `Minimal amount of nanoERG to lock is ${MinPoolNanoErgs}`,
          },
        ]
      : [];
  const errors = [
    invalidPair,
    invalidFeeRange,
    invalidFeeResolution,
    invalidErgsAmount,
  ].flat();

  if (errors.length == 0) {
    const feeNumerator = (1 - fee) * PoolFeeScale;
    const outputShare = sqrt(x.amount * y.amount);
    return { x, y, feeNumerator, lockNanoErgs, outputShare, initiatorPk };
  } else {
    return errors;
  }
}
