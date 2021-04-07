import {PoolSetupParams} from "../models/poolSetupParams";
import {UnsignedInput, UnsignedTransaction} from "ergo-lib-wasm-browser";

export interface PoolTransactions {

    /** Interpret `setup` operation on a pool to a chain of transactions.
     */
    setup(pool: PoolSetupParams, inputs: UnsignedInput): UnsignedTransaction[]
}