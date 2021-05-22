import {Input} from "./input";
import {ErgoBox} from "./ergoBox";

export class ErgoTx {
    constructor(
        public readonly inputs: Input[],
        public readonly outputs: ErgoBox[]
    ) {}
}