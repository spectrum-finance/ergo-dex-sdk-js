import {NetworkContext} from "../../entities/networkContext";
import {BoxSelection} from "./boxSelection";
import {Address} from "../../entities/address";

export type TransactionContext = {
    readonly inputs: BoxSelection,
    readonly selfAddress: Address,
    readonly changeAddress: Address,
    readonly feeNErgs: bigint,
    readonly network: NetworkContext
}
