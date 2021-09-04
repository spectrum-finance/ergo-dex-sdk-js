import {ErgoTree, HexString} from "@ergolabs/ergo-sdk"

export type PoolContracts = {
  poolTree: ErgoTree
  poolTemplateHash: HexString
}
