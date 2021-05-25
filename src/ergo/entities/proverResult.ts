import {ContextExtension} from "./contextExtension";

export type ProverResult = {
    readonly proof: Uint8Array,
    readonly extension: ContextExtension
}