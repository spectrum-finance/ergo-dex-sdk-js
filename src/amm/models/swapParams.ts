import {HexString, PublicKeyHex} from "../../types";
import {TokenId} from "ergo-lib-wasm-browser";
import {TokenAmount} from "../../entities/tokenAmount";

export class SwapParams {
    readonly pk: PublicKeyHex
    readonly poolScriptHash: HexString
    readonly baseInput: TokenAmount
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint

    constructor(
        pk: PublicKeyHex,
        poolScriptHash: HexString,
        baseInput: TokenAmount,
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