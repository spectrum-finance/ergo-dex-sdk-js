import {AssetAmount} from "../../wallet/entities/assetAmount";
import {HexString, NErg, PublicKey, TokenId} from "../../wallet/types";

export class SwapParams {
    readonly pk: PublicKey
    readonly poolScriptHash: HexString
    readonly poolFeeNum: number
    readonly baseInput: AssetAmount
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint
    readonly dexFeePerToken: NErg

    constructor(
        pk: PublicKey,
        poolScriptHash: HexString,
        poolFeeNum: number,
        baseInput: AssetAmount,
        quoteAsset: TokenId,
        minQuoteOutput: bigint,
        dexFeePerToken: NErg
    ) {
        this.pk = pk
        this.poolScriptHash = poolScriptHash
        this.poolFeeNum = poolFeeNum
        this.baseInput = baseInput
        this.quoteAsset = quoteAsset
        this.minQuoteOutput = minQuoteOutput
        this.dexFeePerToken = dexFeePerToken
    }
}