import {Token} from "./token";
import {BoxId, TxId} from "../types";
import {ErgoTree} from "./ergoTree";
import {Registers} from "./registers";

export type ErgoBox = {
    readonly id: BoxId,
    readonly txId: TxId,
    readonly index: number,
    readonly ergoTree: ErgoTree,
    readonly creationHeight: number,
    readonly value: bigint,
    readonly tokens: Token[],
    readonly additionalRegisters: Registers
}