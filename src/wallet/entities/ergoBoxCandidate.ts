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

export function make(
    value: bigint,
    ergoTree: ErgoTree,
    creationHeight: number,
    tokens?: TokenAmount[],
    registers?: Registers
): ErgoBoxCandidate {
    return {
        value,
        ergoTree,
        creationHeight: creationHeight,
        assets: tokens || [],
        additionalRegisters: registers || EmptyRegisters,
    }
}