import {Eip4Asset} from "../wallet/entities/eip4Asset";
import {ErgoNetwork} from "../services/ergoNetwork";
import {TokenId} from "../wallet/types";

export interface Tokens {

    /** Get a token by id.
     */
    get(id: TokenId): Promise<Eip4Asset | undefined>
}

export class NetworkTokens implements Tokens {

    constructor(public readonly network: ErgoNetwork) {}

    get(id: TokenId): Promise<Eip4Asset | undefined> {
        return this.network.getToken(id);
    }
}
