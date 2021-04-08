import {TokenId} from "ergo-lib-wasm-browser";
import {Token} from "../entities/token";

export interface Tokens {

    /** Get a token by id.
      */
    get(id: TokenId): Token | undefined
}