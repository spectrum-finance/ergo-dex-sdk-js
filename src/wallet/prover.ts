import {ErgoTxCandidate} from "./entities/ergoTxCandidate";
import {ErgoTx} from "./entities/ergoTx";
import {Input} from "./entities/input";

export interface Prover {

    sign(tx: ErgoTxCandidate): Promise<ErgoTx>

    signInput(tx: ErgoTxCandidate, input: number): Promise<Input>
}

export class ProverImpl implements Prover {

    sign(tx: ErgoTxCandidate): Promise<ErgoTx> {
        return ergo.sign_tx(tx)
    }

    signInput(tx: ErgoTxCandidate, input: number): Promise<Input> {
        return ergo.sign_tx_input(tx, input)
    }
}
