import {AssetAmount, PublicKey, HexString, NErg, TokenId} from "../../ergo"

export type SwapParams = {
  readonly pk: PublicKey
  readonly poolScriptHash: HexString
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: TokenId
  readonly minQuoteOutput: bigint
  readonly dexFeePerToken: NErg
}
