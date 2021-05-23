import {ProverResult} from "./proverResult";
import {BoxId} from "../types";

export type Input = {
    readonly id: BoxId,
    readonly proof: ProverResult
}