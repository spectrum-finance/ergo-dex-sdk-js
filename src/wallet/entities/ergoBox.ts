import {Token} from "./token";
import {BoxId} from "../types";
import {ErgoBox as LibErgoBox} from "ergo-lib-wasm-browser";
import {notImplemented} from "../../utils/notImplemented";

export class ErgoBox {
    readonly id: BoxId
    readonly value: bigint
    readonly tokens: Token[]

    constructor(id: BoxId, value: bigint, tokens: Token[]) {
        this.id = id
        this.value = value
        this.tokens = tokens
    }

    toErgoLib(): LibErgoBox {
        return notImplemented()
    }
}