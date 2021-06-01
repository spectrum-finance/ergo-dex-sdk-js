import {PoolId} from "../types"
import {AssetInfo, PublicKey} from "../../ergo"

export type RedeemParams = {
  readonly poolId: PoolId
  readonly pk: PublicKey
  readonly lp: AssetInfo
  readonly dexFee: bigint
}
