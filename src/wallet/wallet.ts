import {Prover} from "./prover";
import {Balance} from "./models/balance";
import {Address} from "./entities/address";

export interface Wallet extends Prover {

    /** Get total wallet balance.
     */
    getBalance(): Promise<Balance>

    /** Get change address.
     */
    getChangeAddress(): Promise<Address>

    /** Get wallet addresses.
     * @param unused - show only unused addresses
     */
    getAddresses(unused: boolean): Promise<Address[]>
}