import {ErgoBoxCandidate} from "./ergoBoxCandidate";
import {ErgoBoxCandidates} from "ergo-lib-wasm-browser";

export class OutputCandidates {
    readonly head: ErgoBoxCandidate
    readonly tail: ErgoBoxCandidate[]

    constructor(head: ErgoBoxCandidate, tail?: ErgoBoxCandidate[]) {
        this.head = head
        this.tail = tail ? tail : []
    }

    get nonEmptyArray(): ErgoBoxCandidate[] {
        return [this.head].concat(this.tail)
    }

    toErgoLib(): ErgoBoxCandidates {
        let candidate = new ErgoBoxCandidates(this.head.toErgoLib())
        for (let c of this.tail) candidate.add(c.toErgoLib())
        return candidate
    }
}