import {AssetAmount, PublicKey} from "ergo-sdk"
import {PoolId} from "../types"

export type RedeemParams = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetAmount
  readonly dexFee: bigint
}
