import {TokenAmount} from "./tokenAmount"
import {ErgoTree} from "./ergoTree"
import {Registers} from "./registers"

export type ErgoBoxCandidate = {
  readonly value: number
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly assets: TokenAmount[]
  readonly additionalRegisters: Registers
}
