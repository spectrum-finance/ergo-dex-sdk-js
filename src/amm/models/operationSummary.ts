import {AssetAmount, AssetInfo} from "../../ergo"
import {PoolId} from "../types"

export type OperationSummary = SwapSummary | DepositSummary | RedeemSummary | PoolSetupSummary

export type SwapSummary = {
  from: AssetAmount
  to: AssetInfo
  poolId: PoolId
}

export type DepositSummary = {
  inX: AssetAmount
  inY: AssetAmount
  poolId: PoolId
}

export type RedeemSummary = {
  inLP: AssetAmount
  poolId: PoolId
}

export type PoolSetupSummary = {
  inX: AssetAmount
  inY: AssetAmount
  poolId: PoolId
}
