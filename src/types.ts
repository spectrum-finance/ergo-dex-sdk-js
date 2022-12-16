import {TokenAmount, TokenId} from "@ergolabs/ergo-sdk"

export type NativeExFee = bigint
export type NativeExFeePerToken = number

export type TokenExFee = TokenAmount
export type TokenExFeePerToken = {tokenId: TokenId; amount: number}
