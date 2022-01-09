import {PublicKey} from "@ergolabs/ergo-sdk"

export type LockParams = {
  readonly duration: number
  readonly pk: PublicKey
}
