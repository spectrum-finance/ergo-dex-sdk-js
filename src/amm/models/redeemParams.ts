import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type RedeemParams<ExFee> = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetAmount
  readonly exFee: ExFee
  readonly uiFee: bigint
}
