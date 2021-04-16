import {TokenId} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../entities/assetAmount";
import {HexString, PublicKey} from "../../wallet/types";

export class SwapParams {
    readonly pk: PublicKey
    readonly poolScriptHash: HexString
    readonly baseInput: AssetAmount
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint

    constructor(
        pk: PublicKey,
        poolScriptHash: HexString,
        baseInput: AssetAmount,
        quoteAsset: TokenId,
        minQuoteOutput: bigint
    ) {
        this.pk = pk
        this.poolScriptHash = poolScriptHash
        this.baseInput = baseInput
        this.quoteAsset = quoteAsset
        this.minQuoteOutput = minQuoteOutput
    }
}