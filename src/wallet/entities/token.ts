import {TokenId} from "../types";
import {I64, Token as LibToken, TokenAmount as LibTokenAmount, TokenId as LibTokenId} from "ergo-lib-wasm-browser";

export class Token {
    constructor(
        public readonly tokenId: TokenId,
        public readonly amount: bigint,
        public readonly name?: string,
        public readonly decimals?: number
    ) {}
}