import {TokenId} from "ergo-lib-wasm-browser";

export class Token {
    readonly name: string
    readonly id: TokenId
    readonly decimals: number

    constructor(name: string, id: TokenId, decimals: number) {
        this.name = name
        this.id = id
        this.decimals = decimals
    }
}
