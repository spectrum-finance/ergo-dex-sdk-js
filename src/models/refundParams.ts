import {Address, TxId} from "@ergolabs/ergo-sdk"

export type RefundParams = {
  txId: TxId // txId the operation request to refund was submitted in
  recipientAddress: Address
}
