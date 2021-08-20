import {NativeAssetId} from "../../constants"
import {TokenId} from "../types"

export type AssetInfo = {
  readonly id: TokenId
  readonly name?: string
  readonly decimals?: number
  readonly description?: string
}

export function isNative(ai: AssetInfo): boolean {
  return ai.id === NativeAssetId
}
