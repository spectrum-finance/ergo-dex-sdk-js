import {HexString, PublicKeyHex} from "../types";
import {TokenId} from "ergo-lib-wasm-browser";

export class Swap {
    readonly pk: PublicKeyHex
    readonly poolScriptHash: HexString
    readonly quoteAsset: TokenId
    readonly minQuoteAmount: bigint

    constructor(pk: PublicKeyHex, poolScriptHash: HexString, quoteAsset: TokenId, minQuoteAmount: bigint) {
        this.pk = pk
        this.poolScriptHash = poolScriptHash
        this.quoteAsset = quoteAsset
        this.minQuoteAmount = minQuoteAmount
    }
}