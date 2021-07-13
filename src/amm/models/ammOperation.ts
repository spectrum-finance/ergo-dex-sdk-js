import {BoxId, TxId} from "../../ergo"
import {OperationSummary} from "./operationSummary"

export type OpStatus = "pending" | "submitted" | "executed" | "settled" | "refund"

export const Pending: OpStatus = "pending"
export const Submitted: OpStatus = "submitted"
export const Executed: OpStatus = "executed"
export const Settled: OpStatus = "settled"

export type AmmOperationType = "swap" | "deposit" | "redeem" | "setup"

export const Swap: AmmOperationType = "swap"
export const Deposit: AmmOperationType = "deposit"
export const Redeem: AmmOperationType = "redeem"
export const Setup: AmmOperationType = "setup"

export type AmmOperation = {
  txId: TxId
  boxId: BoxId
  status: OpStatus
  summary: OperationSummary
}
