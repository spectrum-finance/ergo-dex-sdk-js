import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {ExFee, ExFeeType} from "../../../types"
import {PoolId} from "../types"

export type RedeemParams<F extends ExFeeType> = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetAmount
  readonly exFee: ExFee<F>
  readonly uiFee: bigint
}
