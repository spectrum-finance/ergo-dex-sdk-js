import {Token} from "./token";
import {BoxId, Register, TxId} from "../types";
import {ErgoTree} from "./ergoTree";

export class ErgoBox {
    readonly id: BoxId
    readonly txId: TxId
    readonly index: number
    readonly ergoTree: ErgoTree
    readonly creationHeight: number
    readonly value: bigint
    readonly tokens: Token[]
    readonly registers: Register[]

    constructor(
        id: BoxId,
        txId: TxId,
        index: number,
        ergoTree: ErgoTree,
        creationHeight: number,
        value: bigint,
        tokens: Token[],
        registers: Register[]
    ) {
        this.id = id
        this.txId = txId
        this.index = index
        this.ergoTree = ergoTree
        this.creationHeight = creationHeight
        this.value = value
        this.tokens = tokens
        this.registers = registers
    }
}