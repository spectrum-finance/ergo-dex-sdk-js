import {Token} from "./token";
import {MintToken} from "../types";
import {ErgoTree} from "./ergoTree";
import {EmptyRegisters, Registers} from "./registers";

export type ErgoBoxCandidate = {
    readonly value: bigint,
    readonly ergoTree: ErgoTree,
    readonly height: number,
    readonly tokens: Token[],
    readonly registers: Registers,
    readonly tokenToMint?: MintToken
}

export function make(
    value: bigint,
    ergoTree: ErgoTree,
    height: number,
    tokens?: Token[],
    registers?: Registers,
    tokenToMint?: MintToken
): ErgoBoxCandidate {
    return {
        value,
        ergoTree,
        height,
        tokens: tokens || [],
        registers: registers || EmptyRegisters,
        tokenToMint
    }
}