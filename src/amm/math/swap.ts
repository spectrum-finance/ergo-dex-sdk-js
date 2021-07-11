import { AssetAmount } from "../../ergo"

export type SwapExtremums = {
  minDexFee: number,
  maxDexFee: number,
  minOutput: AssetAmount,
  maxOutput: AssetAmount
}

/** @param minDexFee - minimal DEX fee
 *  @param nitro - minimal dex fee multiplier
 *  @param minOutput - minimal output expected
 */
export function swapVars(
  minDexFee: number,
  nitro: number,
  minOutput: AssetAmount
): [number, SwapExtremums] {
  const dexFeePerToken = minDexFee / Number(minOutput.amount)
  const maxDexFee = minDexFee * nitro
  const maxOutput = minOutput.withAmount(BigInt(maxDexFee / dexFeePerToken))
  return [dexFeePerToken, { minDexFee, maxDexFee, minOutput, maxOutput }]
}