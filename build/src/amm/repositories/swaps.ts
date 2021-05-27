import {Address} from "ergo-lib-wasm-browser";
import {Swap} from "../entities/swap";

export interface Swaps {

    /** Get all pending swaps by a given address.
     */
    getAllPendingByAddress(address: Address): Swap[]

    /** Get all completed swaps by a given address.
     */
    getAllCompletedByAddress(address: Address): Swap[]
}