import {ProverResult} from "./proverResult";
import {BoxId} from "../types";

export class Input {
    constructor(
        public readonly id: BoxId,
        public readonly proof: ProverResult
    ) {}
}