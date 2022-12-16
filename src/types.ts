import {TokenAmount, TokenId} from "@ergolabs/ergo-sdk"

export type NativeExFee = bigint
export type NativeExFeePerToken = number

export type TokenExFee = TokenAmount
export type TokenExFeePerToken = {tokenId: TokenId; amount: number}

export type ExFee<T extends NativeExFeeType | TokenExFeeType> = T extends NativeExFeeType ? NativeExFee : TokenExFee
export type ExFeePerToken<T extends NativeExFeeType | TokenExFeeType> = T extends NativeExFeeType
  ? NativeExFeePerToken
  : TokenExFeePerToken

export interface NativeExFeeType {
  _N: unknown
}

export interface TokenExFeeType {
  _T: unknown
}

export type ExFeeType = NativeExFeeType | TokenExFeeType
