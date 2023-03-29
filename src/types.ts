import {TokenAmount, TokenId} from "@ergolabs/ergo-sdk"

export type NativeExFee = bigint
export type NativeExFeePerToken = number

export type SpecExFee = TokenAmount
export type SpecExFeePerToken = {tokenId: TokenId; amount: number}

export type ExFee<T extends NativeExFeeType | SpecExFeeType> = T extends NativeExFeeType
  ? NativeExFee
  : SpecExFee
export type ExFeePerToken<T extends NativeExFeeType | SpecExFeeType> = T extends NativeExFeeType
  ? NativeExFeePerToken
  : SpecExFeePerToken

export interface NativeExFeeType {
  _N: unknown
}

export interface SpecExFeeType {
  _T: unknown
}

export type ExFeeType = NativeExFeeType | SpecExFeeType
