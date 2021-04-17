import {TokenId} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../entities/assetAmount";
import {HexString, PublicKey} from "../../wallet/types";
import {PoolId} from "../types";

export class SwapParams {
    readonly poolId: PoolId
    readonly pk: PublicKey
    readonly poolScriptHash: HexString
    readonly baseInput: AssetAmount
    readonly quoteAsset: TokenId
    readonly minQuoteOutput: bigint

    constructor(
        poolId: PoolId,
        pk: PublicKey,
        poolScriptHash: HexString,
        baseInput: AssetAmount,
        quoteAsset: TokenId,
        minQuoteOutput: bigint
    ) {
        this.poolId = poolId
        this.pk = pk
        this.poolScriptHash = poolScriptHash
        this.baseInput = baseInput
        this.quoteAsset = quoteAsset
        this.minQuoteOutput = minQuoteOutput
    }
}