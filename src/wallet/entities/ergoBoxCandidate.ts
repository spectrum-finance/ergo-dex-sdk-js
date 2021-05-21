import {Token} from "./token";
import {MintToken, Register} from "../types";
import {ErgoTree} from "./ergoTree";

export class ErgoBoxCandidate {
    readonly value: bigint
    readonly ergoTree: ErgoTree
    readonly height: number

    readonly tokens: Token[]
    readonly registers: Register[]
    readonly tokenToMint?: MintToken

    constructor(
        value: bigint,
        ergoTree: ErgoTree,
        height: number,
        tokens?: Token[],
        registers?: Register[],
        tokenToMint?: MintToken
    ) {
        this.value = value
        this.ergoTree = ergoTree
        this.height = height
        this.tokens = tokens || []
        this.registers = registers || []
        this.tokenToMint = tokenToMint
    }
}