import {PublicKeyHex} from "../../types";
import {Address, TokenId} from "ergo-lib-wasm-browser";
import {TokenAmount} from "../../entities/tokenAmount";

export class Swap {
    readonly pk: PublicKeyHex
    readonly poolAddress: Address
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint
    readonly baseInput: TokenAmount
    readonly timestamp: number

    constructor(
        pk: PublicKeyHex,
        poolAddress: Address,
        quoteAsset: TokenId,
        minQuoteOutput: bigint,
        baseInput: TokenAmount,
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