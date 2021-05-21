import {TokenId} from "../types";
import {I64, Token as LibToken, TokenAmount as LibTokenAmount, TokenId as LibTokenId} from "ergo-lib-wasm-browser";

export class Token {
    readonly id: TokenId
    readonly amount: bigint

    constructor(id: TokenId, amount: bigint) {
        this.id = id
        this.amount = amount
    }

    toErgoLib(): LibToken {
        return new LibToken(LibTokenId.from_str(this.id), LibTokenAmount.from_i64(I64.from_str(this.amount.toString())))
    }
}