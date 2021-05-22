import {TokenId} from "../types";

export class AssetInfo {
    constructor(
        public readonly id: TokenId,
        public readonly name?: string,
        public readonly decimals?: number,
        public readonly description?: string
    ) {}
}
