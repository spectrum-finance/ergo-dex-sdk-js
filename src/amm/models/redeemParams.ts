import {PoolId} from "../types"
import {AssetAmount, PublicKey} from "../../ergo"

export type RedeemParams = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetAmount
  readonly dexFee: bigint
}
