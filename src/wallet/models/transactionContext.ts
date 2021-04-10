import {NetworkContext} from "./networkContext";
import {BoxSelection} from "../entities/boxSelection";
import {Address} from "ergo-lib-wasm-browser";

export class TransactionContext {
    readonly inputs: BoxSelection
    readonly changeAddress: Address
    readonly feeNErgs: bigint
    readonly network: NetworkContext

    constructor(inputs: BoxSelection, changeAddress: Address, feeNErgs: bigint, networkCtx: NetworkContext) {
        this.inputs = inputs
        this.changeAddress = changeAddress
        this.feeNErgs = feeNErgs
        this.network = networkCtx
    }
}