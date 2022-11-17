import {ErgoTree, HexString} from "@ergolabs/ergo-sdk"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PoolContracts<Pool> = {
  poolTree: ErgoTree
  poolTemplateHash: HexString
}
