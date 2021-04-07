import {PoolSetupParams} from "../models/poolSetupParams";
import {UnsignedInput, UnsignedTransaction} from "ergo-lib-wasm-browser";
import {PoolId} from "../types";
import {SwapParams} from "../models/swapParams";

export interface PoolOpsInterpreter {

    /** Interpret `setup` operation on a pool to a chain of transactions.
     */
    setup(params: PoolSetupParams, inputs: UnsignedInput[]): UnsignedTransaction[]

    /** Interpret `deposit` operation on a pool to a transaction.
     */
    deposit(poolId: PoolId, inputs: UnsignedInput[]): UnsignedTransaction

    /** Interpret `redeem` operation on a pool to a transaction.
     */
    redeem(poolId: PoolId, inputs: UnsignedInput[]): UnsignedTransaction

    /** Interpret `swap` operation on a pool to a transaction.
     */
    swap(poolId: PoolId, params: SwapParams, inputs: UnsignedInput[]): UnsignedTransaction
}