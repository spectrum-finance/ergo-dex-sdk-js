import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type DepositParams<ExFee> = {
  readonly poolId: PoolId
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly pk: PublicKey
  readonly exFee: ExFee
  readonly uiFee: bigint
}
