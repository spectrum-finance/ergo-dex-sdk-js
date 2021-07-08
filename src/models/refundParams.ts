import { Address, TxId } from "../ergo"

export type RefundParams = {
  txId: TxId,
  recipientAddress: Address
}