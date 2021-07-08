import { ErgoTx, TransactionContext } from "../../ergo"
import { RefundParams } from "../../models/refundParams"

export interface Refunds {

  // 1. Fetch req tx in explorer 2. Find output to spend 3.
  refund(params: RefundParams, ctx: TransactionContext): Promise<ErgoTx>
}