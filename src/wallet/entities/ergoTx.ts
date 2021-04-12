import {Input} from "./input";
import {ErgoBox} from "./ergoBox";

export class ErgoTx {
    readonly inputs: Input[]
    readonly outputs: ErgoBox[]

    constructor(inputs: Input[], outputs: ErgoBox[]) {
        this.inputs = inputs
        this.outputs = outputs
    }
}