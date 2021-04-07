import {InvalidParam} from "./invalidParam";

export class InvalidParams {
    readonly errors: InvalidParam[]

    constructor(errors: InvalidParam[]) {
        this.errors = errors
    }
}