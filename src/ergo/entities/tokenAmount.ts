import {TokenId} from "../types"

export type TokenAmount = {
  readonly tokenId: TokenId
  readonly amount: number
  readonly name?: string
  readonly decimals?: number
}
