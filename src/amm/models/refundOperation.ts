import {TxId} from "../../ergo"
import {RefundableAmmOperationType} from "./ammOperation"

export type RefundStatus = "pending" | "executed" | "settled"

export const Pending: RefundStatus = "pending"
export const Executed: RefundStatus = "executed"
export const Settled: RefundStatus = "settled"

export type RefundOperation = {
  tag: "refund"
  txId: TxId
  status: RefundStatus
  operation: RefundableAmmOperationType
}
