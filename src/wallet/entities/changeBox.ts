import {TokenId} from "../types";

export class ChangeBox {
    readonly value: bigint
    readonly tokens: Map<TokenId, bigint>

    constructor(value: bigint, tokens: Map<TokenId, bigint>) {
        this.value = value
        this.tokens = tokens
    }
}