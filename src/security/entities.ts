import {AssetAmount, BoxId, PublicKey} from "@ergolabs/ergo-sdk"

export type TokenLock = {
  readonly boxId: BoxId
  readonly lockedAsset: AssetAmount
  readonly deadline: number
  readonly redeemer: PublicKey
  readonly active: boolean
}
