import {InvalidParams} from "../errors/invalidParams"
import {MinPoolNanoErgs, PoolFeeMaxDecimals, PoolFeeScale} from "../constants"
import {AssetAmount} from "../../ergo"
import {sqrt} from "../../utils/sqrt"

export type PoolSetupParams = {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly feeNumerator: number
  readonly lockNanoErgs: bigint
  readonly outputShare: bigint
}

export function make(
  x: AssetAmount,
  y: AssetAmount,
  fee: number,
  lockNanoErgs: bigint
): PoolSetupParams | InvalidParams {
  let invalidPair = x.asset === y.asset ? [{param: "x|y", error: "x|y must contain different tokens"}] : []
  let invalidFeeRange = fee > 1 && fee < 0 ? [{param: "fee", error: "Fee must be in range [0, 1]"}] : []
  let invalidFeeResolution =
    fee.toString().split(".")[1].length > PoolFeeMaxDecimals
      ? [
          {
            param: "fee",
            error: `Fee must have <= ${PoolFeeMaxDecimals} decimals`,
          },
        ]
      : []
  let invalidErgsAmount =
    lockNanoErgs < MinPoolNanoErgs
      ? [
          {
            param: "lockNanoErgs",
            error: `Minimal amount of nanoERG to lock is ${MinPoolNanoErgs}`,
          },
        ]
      : []
  let errors = [invalidPair, invalidFeeRange, invalidFeeResolution, invalidErgsAmount].flat()

  if (errors.length == 0) {
    let feeNumerator = (1 - fee) * PoolFeeScale
    let outputShare = sqrt(x.amount * y.amount)
    return {x, y, feeNumerator, lockNanoErgs, outputShare}
  } else {
    return errors
  }
}
