import {AssetAmount} from "../../ergo"
import {decimalToFractional} from "../contracts/t2tPoolContracts"
import {I64Max} from "../constants"

export type SwapExtremums = {
  minDexFee: bigint
  maxDexFee: bigint
  minOutput: AssetAmount
  maxOutput: AssetAmount
}

/** @param minDexFee - minimal DEX fee
 *  @param nitro - minimal dex fee multiplier
 *  @param minOutput - minimal output expected
 *  @return DEX fee per token, swap extremums
 */
export function swapVars(minDexFee: bigint, nitro: number, minOutput: AssetAmount): [number, SwapExtremums] {
  let dexFeePerToken = Number(minDexFee) / Number(minOutput.amount)
  while (true) {
    const [n, d] = decimalToFractional(dexFeePerToken)
    if (n <= I64Max && d <= I64Max) break
    else {
      const feeStr = String(dexFeePerToken)
      const idx = feeStr.indexOf(".")
      const decimalsNum = feeStr.slice(idx + 1).length
      dexFeePerToken = Number(dexFeePerToken.toFixed(decimalsNum - 1))
    }
  }
  const adjustedMinDexFee = Math.floor(dexFeePerToken * Number(minOutput.amount))
  const maxDexFee = Math.floor(Number(minDexFee) * nitro)
  const maxOutput = minOutput.withAmount(BigInt(Math.floor(maxDexFee / dexFeePerToken)))
  return [
    dexFeePerToken,
    {minDexFee: BigInt(adjustedMinDexFee), maxDexFee: BigInt(maxDexFee), minOutput, maxOutput}
  ]
}
