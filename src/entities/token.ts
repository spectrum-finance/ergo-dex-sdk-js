import {TokenId} from "ergo-lib-wasm-browser";

export class Token {
    readonly name: string
    readonly id: TokenId
    readonly decimals: number
    readonly description?: string

    constructor(id: TokenId, name: string, decimals: number, description?: string) {
        this.id = id
        this.name = name
        this.decimals = decimals
        this.description = description
    }
}
