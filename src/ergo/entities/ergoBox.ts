import {TokenAmount} from "./tokenAmount"
import {BoxId, TxId} from "../types"
import {ErgoTree} from "./ergoTree"
import {Registers} from "./registers"

export type ErgoBox = {
  readonly boxId: BoxId
  readonly transactionId: TxId
  readonly index: number
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly value: number
  readonly assets: TokenAmount[]
  readonly additionalRegisters: Registers
}
