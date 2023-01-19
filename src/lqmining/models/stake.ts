import {AssetAmount} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type Stake = {
  readonly poolId: PoolId
  readonly lockedLq: AssetAmount
  readonly bundleKeyAsset: AssetAmount
}
