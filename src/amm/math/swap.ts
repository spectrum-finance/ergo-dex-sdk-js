import {AssetAmount} from "../../ergo"
import {MaxDecimals} from "../constants"

export type SwapExtremums = {
  minDexFee: number
  maxDexFee: number
  minOutput: AssetAmount
  maxOutput: AssetAmount
}

/** @param minDexFee - minimal DEX fee
 *  @param nitro - minimal dex fee multiplier
 *  @param minOutput - minimal output expected
 *  @return DEX fee per token, swap extremums
 */
export function swapVars(minDexFee: number, nitro: number, minOutput: AssetAmount): [number, SwapExtremums] {
  const dexFeePerToken = Number((minDexFee / Number(minOutput.amount)).toFixed(MaxDecimals))
  const maxDexFee = Math.floor(minDexFee * nitro)
  const maxOutput = minOutput.withAmount(BigInt(Math.floor(maxDexFee / dexFeePerToken)))
  return [dexFeePerToken, {minDexFee, maxDexFee, minOutput, maxOutput}]
}
