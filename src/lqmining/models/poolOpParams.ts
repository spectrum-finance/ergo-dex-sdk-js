import {AssetAmount, PublicKey} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type PoolSetupConf = {
  readonly budget: AssetAmount
}

export type LqDepositConf = {
  readonly poolId: PoolId
  readonly fullEpochsRemain: number
  readonly depositAmount: AssetAmount
  readonly redeemerPk: PublicKey
  readonly executionFee: bigint
}

export type LqRedeemConf = {
  readonly expectedLqAmount: AssetAmount
  readonly redeemerKey: AssetAmount
  readonly redeemerPk: PublicKey
  readonly executionFee: bigint
}
