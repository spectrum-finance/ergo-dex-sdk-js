import {AssetInfo} from "../ergo/entities/assetInfo";
import {ErgoNetwork} from "../services/ergoNetwork";
import {TokenId} from "../ergo/types";

export interface Tokens {

    /** Get a token by id.
     */
    get(id: TokenId): Promise<AssetInfo | undefined>
}

export class NetworkTokens implements Tokens {

    constructor(public readonly network: ErgoNetwork) {}

    get(id: TokenId): Promise<AssetInfo | undefined> {
        return this.network.getToken(id);
    }
}
