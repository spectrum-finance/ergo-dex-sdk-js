import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {ExFee, ExFeeType} from "../../types"
import {PoolId} from "../types"

export type DepositParams<F extends ExFeeType> = {
  readonly poolId: PoolId
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly pk: PublicKey
  readonly exFee: ExFee<F>
  readonly uiFee: bigint
}
