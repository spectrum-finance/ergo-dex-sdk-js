import {TokenId} from "../types";

export type Token = {
    readonly id: TokenId,
    readonly amount: bigint,
    readonly name?: string,
    readonly decimals?: number
}