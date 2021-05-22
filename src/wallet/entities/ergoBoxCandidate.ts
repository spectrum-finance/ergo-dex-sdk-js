import {Token} from "./token";
import {MintToken} from "../types";
import {ErgoTree} from "./ergoTree";
import {EmptyRegisters, Registers} from "./registers";

export class ErgoBoxCandidate {
    readonly value: bigint
    readonly ergoTree: ErgoTree
    readonly height: number

    readonly tokens: Token[]
    readonly registers: Registers
    readonly tokenToMint?: MintToken

    constructor(
        value: bigint,
        ergoTree: ErgoTree,
        height: number,
        tokens?: Token[],
        registers?: Registers,
        tokenToMint?: MintToken
    ) {
        this.value = value
        this.ergoTree = ergoTree
        this.height = height
        this.tokens = tokens || []
        this.registers = registers || EmptyRegisters
        this.tokenToMint = tokenToMint
    }
}