import {TokenId} from "ergo-lib-wasm-browser";
import {Eip4Token} from "../entities/eip4Token";

export interface Tokens {

    /** Get a token by id.
      */
    get(id: TokenId): Eip4Token | undefined
}