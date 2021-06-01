import {Input} from "./input"
import {ErgoBox} from "./ergoBox"
import {DataInput} from "./dataInput"
import {TxId} from "../types"

export type ErgoTx = {
  readonly id: TxId
  readonly inputs: Input[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBox[]
  readonly size: number
}
