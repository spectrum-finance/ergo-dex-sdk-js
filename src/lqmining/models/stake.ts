import {AssetAmount, TokenId} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type Stake = {
  readonly poolId: PoolId
  readonly redeemerKeyId: TokenId
  readonly lockedLq: AssetAmount
  readonly bundleKeyAsset: AssetAmount
}
