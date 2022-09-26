import {ErgoTree, PublicKey, TokenId} from "@ergolabs/ergo-sdk"
import {notImplemented} from "../../utils/notImplemented"
import {PoolId} from "../types"

export function deposit(
  poolId: PoolId,
  redeemerPk: PublicKey,
  expectedNumEpochs: number
): ErgoTree {
  return notImplemented([poolId, redeemerPk, expectedNumEpochs])
}

export function redeem(
  redeemerPk: PublicKey,
  lqId: TokenId,
  expectedLqAmount: bigint
): ErgoTree {
  return notImplemented([redeemerPk, lqId, expectedLqAmount])
}
