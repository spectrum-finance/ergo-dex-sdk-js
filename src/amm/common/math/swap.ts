import {AssetAmount} from "@ergolabs/ergo-sdk"
import {decimalToFractional} from "../../../utils/math"
import {I64Max} from "../constants"

export type SwapExtremums = {
  minExFee: bigint
  maxExFee: bigint
  minOutput: AssetAmount
  maxOutput: AssetAmount
}

/** @param minExFee - minimal Execution fee
 *  @param nitro - minimal dex fee multiplier
 *  @param minOutput - minimal output expected
 *  @return DEX fee per token, swap extremums
 */
export function swapVars(
  minExFee: bigint,
  nitro: number,
  minOutput: AssetAmount
): [number, SwapExtremums] | undefined {
  if (minOutput.amount > 0) {
    let exFeePerToken = Number(minExFee) / Number(minOutput.amount)
    while (true) {
      const [n, d] = decimalToFractional(exFeePerToken)
      if (n <= I64Max && d <= I64Max) break
      else {
        const feeStr = String(exFeePerToken)
        const idx = feeStr.indexOf(".")
        const decimalsNum = feeStr.slice(idx + 1).length
        exFeePerToken = Number(exFeePerToken.toFixed(decimalsNum - 1))
      }
    }
    const adjustedMinExFee = Math.floor(exFeePerToken * Number(minOutput.amount))
    const maxExFee = Math.floor(Number(minExFee) * nitro)
    const maxOutput = minOutput.withAmount(BigInt(Math.floor(maxExFee / exFeePerToken)))
    return [
      exFeePerToken,
      {minExFee: BigInt(adjustedMinExFee), maxExFee: BigInt(maxExFee), minOutput, maxOutput}
    ]
  } else {
    return undefined
  }
}
