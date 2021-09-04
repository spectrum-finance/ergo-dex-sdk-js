import {AssetAmount, AssetInfo} from "ergo-sdk"
import {PoolId} from "../types"
import {AmmOperationType} from "./ammOperation"

export type OperationSummary = {type: AmmOperationType; poolId: PoolId} & (
  | SwapSummary
  | DepositSummary
  | RedeemSummary
  | PoolSetupSummary
)

export type SwapSummary = {
  from: AssetAmount
  to: AssetInfo
}

export type DepositSummary = {
  inX: AssetAmount
  inY: AssetAmount
}

export type RedeemSummary = {
  inLP: AssetAmount
}

export type PoolSetupSummary = {
  initX: AssetAmount
  initY: AssetAmount
}
