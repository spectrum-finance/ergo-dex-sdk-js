import {AssetAmount, BoxId, TxId} from "../../ergo"
import {AmmOrderInfo} from "./ammOrderInfo"
import {AmmPoolInfo} from "./ammPoolInfo"

export type AmmOrderStatus = "pending" | "submitted" | "executed" | "settled" | "refund"

export type AmmOrderType = "swap" | "deposit" | "redeem"

export type AmmDexOperationType = "order" | "refund" | "setup"

export type AmmOrder = {
  type: "order"
  txId: TxId
  boxId: BoxId
  status: AmmOrderStatus
  order: AmmOrderInfo
}

export type TxStatus = "pending" | "executed" | "settled"

export type PoolSetup = {
  type: "setup"
  txId: TxId
  status: TxStatus
  pool: AmmPoolInfo
  reward: AssetAmount
}

export type RefundOperation = {
  type: "refund"
  txId: TxId
  status: TxStatus
  operation: AmmOrderType
}

export type AmmDexOperation = AmmOrder | RefundOperation | PoolSetup
