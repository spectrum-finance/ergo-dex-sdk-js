import {AssetAmount, AssetInfo} from "ergo-sdk"
import {PoolId} from "../types"

export type AmmOrderInfo = {poolId: PoolId} & (Swap | Deposit | Redeem)

export type Swap = {
  type: "swap"
  from: AssetAmount
  to: AssetInfo
}

export type Deposit = {
  type: "deposit"
  inX: AssetAmount
  inY: AssetAmount
}

export type Redeem = {
  type: "redeem"
  inLP: AssetAmount
}
