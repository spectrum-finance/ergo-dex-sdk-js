import {ErgoTxCandidate} from "./entities/ergoTxCandidate";
import {ErgoTx} from "./entities/ergoTx";
import {Input} from "./entities/input";

export interface Prover {

    /** Sign the given transaction.
     */
    sign(tx: ErgoTxCandidate): Promise<ErgoTx>

    /** Sign particular input of the given transaction.
     */
    signInput(tx: ErgoTxCandidate, input: number): Promise<Input>
}
