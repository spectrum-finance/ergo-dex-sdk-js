import {AssetAmount} from "../../wallet/entities/assetAmount";
import {HexString, NErg, TokenId} from "../../wallet/types";
import {PublicKey} from "../../wallet/entities/publicKey";

export class SwapParams {
    constructor(
        public readonly pk: PublicKey,
        public readonly poolScriptHash: HexString,
        public readonly poolFeeNum: number,
        public readonly baseInput: AssetAmount,
        public readonly quoteAsset: TokenId,
        public readonly minQuoteOutput: bigint,
        public readonly dexFeePerToken: NErg
    ) {}
}