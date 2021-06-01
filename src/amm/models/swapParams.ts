import {AssetAmount, PublicKey} from "../../ergo"
import {HexString, NErg, TokenId} from "../../ergo/types"

export type SwapParams = {
  readonly pk: PublicKey
  readonly poolScriptHash: HexString
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: TokenId
  readonly minQuoteOutput: bigint
  readonly dexFeePerToken: NErg
}
