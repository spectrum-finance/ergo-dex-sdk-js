import {Address, TokenId} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../wallet/entities/assetAmount";
import {PublicKey} from "../../wallet/types";

export class Swap {
    readonly pk: PublicKey
    readonly poolAddress: Address
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint
    readonly baseInput: AssetAmount
    readonly timestamp: number

    constructor(
        pk: PublicKey,
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