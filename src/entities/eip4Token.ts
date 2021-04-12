import {TokenId} from "../wallet/types";

export class Eip4Token {
    readonly id: TokenId
    readonly name: string
    readonly decimals: number
    readonly description?: string

    constructor(id: TokenId, name: string, decimals: number, description?: string) {
        this.id = id
        this.name = name
        this.decimals = decimals
        this.description = description
    }
}
