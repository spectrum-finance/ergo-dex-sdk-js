import {ErgoTree, HexString} from "@ergolabs/ergo-sdk"
import {PoolContracts} from "../../contracts/poolContracts"
import {notImplemented} from "../../utils/notImplemented"
import {LmPool} from "../entities/lmPool"

export function pool(): ErgoTree {
  return notImplemented()
}

export function poolTemplateHash(): HexString {
  return notImplemented()
}

export function poolBundle(): PoolContracts<LmPool> {
  return {
    poolTree: pool(),
    poolTemplateHash: poolTemplateHash()
  }
}
