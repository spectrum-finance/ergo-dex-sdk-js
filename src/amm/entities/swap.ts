import {Address, TokenId} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../wallet/entities/assetAmount";
import {PublicKey} from "../../wallet/entities/publicKey";

export class Swap {
    constructor(
        public readonly pk: PublicKey,
        public readonly poolAddress: Address,
        public readonly quoteAsset: TokenId,
        public readonly minQuoteOutput: bigint,
        public readonly baseInput: AssetAmount,
        public readonly timestamp: number
    ) {}
}