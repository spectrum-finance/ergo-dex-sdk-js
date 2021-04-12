import {TokenId} from "ergo-lib-wasm-browser";
import {Asset} from "../entities/asset";

export interface Tokens {

    /** Get a token by id.
      */
    get(id: TokenId): Asset | undefined
}