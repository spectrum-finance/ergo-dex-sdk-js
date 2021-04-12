import {ErgoTxCandidate} from "./entities/ergoTxCandidate";
import {ErgoTx} from "./entities/ergoTx";

export interface ErgoWallet {

    sign(txCandidate: ErgoTxCandidate): ErgoTx
}