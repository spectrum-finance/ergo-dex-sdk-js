import {ErgoTree, HexString} from "ergo-sdk"

export type PoolContracts = {
  poolTree: ErgoTree
  poolTemplateHash: HexString
}
