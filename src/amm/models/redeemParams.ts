import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type RedeemParams = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetAmount
  readonly exFee: bigint
  readonly uiFeeNErgs: bigint
}
