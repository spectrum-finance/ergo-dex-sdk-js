import {BoxSelection} from "./boxSelection";
import {ErgoBoxCandidate} from "./ergoBoxCandidate";
import {Address} from "./address";

export class ErgoTxCandidate {
    readonly inputs: BoxSelection
    readonly outputs: ErgoBoxCandidate[]
    readonly height: number
    readonly feeNErgs: bigint
    readonly changeAddress: Address

    constructor(
        inputs: BoxSelection,
        outputs: ErgoBoxCandidate[],
        height: number,
        feeNErgs: bigint,
        changeAddress: Address
    ) {
        this.inputs = inputs
        this.outputs = outputs
        this.height = height
        this.feeNErgs = feeNErgs
        this.changeAddress = changeAddress
    }
}