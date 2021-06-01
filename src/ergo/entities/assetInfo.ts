import {TokenId} from "../types"

export type AssetInfo = {
  readonly id: TokenId
  readonly name?: string
  readonly decimals?: number
  readonly description?: string
}
