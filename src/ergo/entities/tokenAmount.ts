import {TokenId} from "../types"

export type TokenAmount = {
  readonly tokenId: TokenId
  readonly amount: bigint
  readonly name?: string
  readonly decimals?: number
}

export function fixTokenAmount(tokenAmount: TokenAmount): TokenAmount {
  return {...tokenAmount, amount: BigInt(tokenAmount.amount)}
}

export type TokenAmountProxy = {
  readonly tokenId: TokenId
  readonly amount: string
  readonly name?: string
  readonly decimals?: number
}

export function tokenAmountFromProxy(proxy: TokenAmountProxy): TokenAmount {
  return {...proxy, amount: BigInt(proxy.amount)}
}

export function tokenAmountToProxy(tokenAmount: TokenAmount): TokenAmountProxy {
  return {
    ...tokenAmount,
    amount: tokenAmount.amount.toString()
  }
}
