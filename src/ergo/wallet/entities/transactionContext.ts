import {NetworkContext} from "./networkContext";
import {BoxSelection} from "./boxSelection";
import {Address} from "../../entities/address";

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