import {TokenId} from "../types";

export type TokenAmount = {
    readonly tokenId: TokenId,
    readonly amount: bigint,
    readonly name?: string,
    readonly decimals?: number
}