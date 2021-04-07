import {TokenPair} from "../../types";
import {TokenId} from "ergo-lib-wasm-browser";
import {Pair} from "../entities/pair";

export interface Pairs {

    /** Get all available pairs.
     */
    getAll(): TokenPair[]

    /** Get pairs involving a given token.
     */
    getInvolving(token: TokenId): TokenPair[]

    /** Get concrete pair.
     */
    get(tokenX: TokenId, tokenY: TokenId): Pair | undefined
}