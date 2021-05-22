import {ContextExtension} from "./contextExtension";

export class ProverResult {
    constructor(
        public readonly proof: Uint8Array,
        public readonly extension: ContextExtension
    ) {}
}