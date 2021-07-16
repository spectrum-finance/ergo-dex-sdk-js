import {BoxId, TxId} from "../types"
import {ContextExtension} from "./contextExtension"
import {ErgoTree} from "./ergoTree"
import {TokenAmount} from "./tokenAmount"
import {Registers} from "./registers"

export type UnsignedInput = {
  readonly boxId: BoxId
  readonly transactionId: TxId
  readonly index: number
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly value: bigint
  readonly assets: TokenAmount[]
  readonly additionalRegisters: Registers
  readonly extension: ContextExtension
}
