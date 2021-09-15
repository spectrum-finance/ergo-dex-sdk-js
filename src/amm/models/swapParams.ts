import {AssetAmount, PublicKey, TokenId} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type SwapParams = {
  readonly pk: PublicKey
  readonly poolId: PoolId
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: TokenId
  readonly minQuoteOutput: bigint
  readonly exFeePerToken: number
  readonly uiFeeNErgs: bigint
}
