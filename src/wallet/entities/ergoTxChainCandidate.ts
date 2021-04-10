import {ErgoTxCandidate} from "./ergoTxCandidate";

export class ErgoTxChainCandidate {
    readonly first: ErgoTxCandidate
    readonly second: ErgoTxCandidate
    readonly others: ErgoTxCandidate[]

    constructor(first: ErgoTxCandidate, second: ErgoTxCandidate, others?: ErgoTxCandidate[]) {
        this.first = first
        this.second = second
        this.others = others || []
    }
}