import {PublicKeyHex} from "../../types";
import {Address, TokenId} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../entities/assetAmount";

export class Swap {
    readonly pk: PublicKeyHex
    readonly poolAddress: Address
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint
    readonly baseInput: AssetAmount
    readonly timestamp: number

    constructor(
        pk: PublicKeyHex,
        poolAddress: Address,
        quoteAsset: TokenId,
        minQuoteOutput: bigint,
        baseInput: AssetAmount,
        timestamp: number
    ) {
        this.pk = pk
        this.poolAddress = poolAddress
        this.quoteAsset = quoteAsset
        this.minQuoteOutput = minQuoteOutput
        this.baseInput = baseInput
        this.timestamp = timestamp
    }
}