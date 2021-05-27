import {TokenAmount} from "./tokenAmount";
import {ErgoTree} from "./ergoTree";
import {EmptyRegisters, Registers} from "./registers";

export type ErgoBoxCandidate = {
    readonly value: bigint,
    readonly ergoTree: ErgoTree,
    readonly creationHeight: number,
    readonly assets: TokenAmount[],
    readonly additionalRegisters: Registers
}