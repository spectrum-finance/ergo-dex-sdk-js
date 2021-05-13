import {Eip4Token} from "../wallet/entities/eip4Token";
import {ErgoNetwork} from "../services/ergoNetwork";
import {TokenId} from "../wallet/types";

export interface Tokens {

    /** Get a token by id.
     */
    get(id: TokenId): Promise<Eip4Token | undefined>
}

export class NetworkTokens implements Tokens {

    readonly network: ErgoNetwork

    constructor(network: ErgoNetwork) {
        this.network = network
    }

    get(id: TokenId): Promise<Eip4Token | undefined> {
        return this.network.getToken(id);
    }
}
