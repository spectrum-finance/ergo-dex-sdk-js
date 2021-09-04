import {PoolId} from "../types"
import {AssetAmount, PublicKey} from "../../ergo"

export type DepositParams = {
  readonly poolId: PoolId
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly pk: PublicKey
  readonly dexFee: bigint
}
