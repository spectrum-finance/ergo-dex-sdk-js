import {Address, TxId} from "../ergo"

export type RefundParams = {
  txId: TxId // txId the operation request to refund was submitted in
  recipientAddress: Address
}
