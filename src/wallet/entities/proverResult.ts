import {ContextExtension} from "./contextExtension";

export class ProverResult {
    readonly proof: Uint8Array
    readonly extension: ContextExtension

    constructor(proof: Uint8Array, extension: ContextExtension) {
        this.proof = proof
        this.extension = extension
    }
}