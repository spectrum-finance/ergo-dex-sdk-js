import {Address, BoxId, PublicKey} from "@ergolabs/ergo-sdk"

export type LockParams = {
  readonly deadline: number
  readonly redeemer: PublicKey
}

export type WithdrawalParams = {
  readonly boxId: BoxId // locked box
  readonly address: Address
}

export type RelockParams = {
  readonly boxId: BoxId // locked box
  readonly updateRedeemer?: PublicKey
  readonly updateDeadline?: number
}
