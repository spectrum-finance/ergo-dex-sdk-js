import {UnsignedInput} from "./unsignedInput"
import {DataInput} from "./dataInput"
import { ErgoBoxCandidate } from "./ergoBoxCandidate"

export type UnsignedErgoTx = {
  readonly inputs: UnsignedInput[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBoxCandidate[]
}
