import {AssetAmount, isNative} from "@ergolabs/ergo-sdk"
import {InvalidParams} from "../errors/invalidParams"
import {PoolFeeMaxDecimals, PoolFeeScale} from "../constants"
import {sqrt} from "../../utils/sqrt"

export type PoolSetupParams = {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly feeNumerator: number
  readonly outputShare: bigint
  readonly uiFeeNErgs: bigint
}

export function makePoolSetupParams(
  x: AssetAmount,
  y: AssetAmount,
  fee: number,
  uiFee: bigint
): PoolSetupParams | InvalidParams {
  const invalidPair = x.asset === y.asset ? [{param: "x|y", error: "x|y must contain different tokens"}] : []
  const invalidFeeRange = fee > 1 && fee < 0 ? [{param: "fee", error: "Fee must be in range [0, 1]"}] : []
  const invalidFeeResolution =
    fee.toString().split(".")[1].length > PoolFeeMaxDecimals
      ? [
          {
            param: "fee",
            error: `Fee must have <= ${PoolFeeMaxDecimals} decimals`
          }
        ]
      : []
  const errors = [invalidPair, invalidFeeRange, invalidFeeResolution].flat()

  if (errors.length == 0) {
    const feeNumerator = (1 - fee) * PoolFeeScale
    const outputShare = sqrt(x.amount * y.amount)
    return isNative(y.asset)
      ? {y, x, feeNumerator, outputShare, uiFeeNErgs: uiFee}
      : {x, y, feeNumerator, outputShare, uiFeeNErgs: uiFee}
  } else {
    return errors
  }
}
