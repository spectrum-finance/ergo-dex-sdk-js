import {ProverResult} from "./proverResult";
import {BoxId} from "../types";

export class Input {
    readonly id: BoxId
    readonly proof: ProverResult

    constructor(id: BoxId, proof: ProverResult) {
        this.id = id
        this.proof = proof
    }
}