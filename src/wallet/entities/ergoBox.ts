import {Token} from "./token";
import {BoxId, TxId} from "../types";
import {ErgoTree} from "./ergoTree";
import {Registers} from "./registers";

export class ErgoBox {
    constructor(
        public readonly id: BoxId,
        public readonly txId: TxId,
        public readonly index: number,
        public readonly ergoTree: ErgoTree,
        public readonly creationHeight: number,
        public readonly value: bigint,
        public readonly tokens: Token[],
        public readonly additionalRegisters: Registers
    ) {}
}