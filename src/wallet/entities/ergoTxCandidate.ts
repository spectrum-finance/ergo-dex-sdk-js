import {BoxSelection} from "./boxSelection";
import {ErgoBoxCandidate} from "./ergoBoxCandidate";
import {Address} from "./address";
import {TxId} from "../types";
import {notImplemented} from "../../utils/notImplemented";

export class ErgoTxCandidate {
    readonly id: TxId
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
        this.id = notImplemented()
        this.inputs = inputs
        this.outputs = outputs
        this.height = height
        this.feeNErgs = feeNErgs
        this.changeAddress = changeAddress
    }
}