import {Input} from "./input";
import {ErgoBox} from "./ergoBox";

export type ErgoTx = {
    readonly inputs: Input[],
    readonly outputs: ErgoBox[]
}