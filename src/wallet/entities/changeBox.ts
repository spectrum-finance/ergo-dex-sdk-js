import {TokenId} from "../types";

export class ChangeBox {
    constructor(
        public readonly value: bigint,
        public readonly tokens: Map<TokenId, bigint>
    ) {}
}