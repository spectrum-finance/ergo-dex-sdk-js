import {HexString} from "../types";
import * as wasm from "ergo-lib-wasm-browser";
import {Address} from "./address";

export type ErgoTree = HexString

export function ergoTreeFromAddress(addr: Address): ErgoTree {
    return wasm.Address.from_base58(addr).to_ergo_tree().to_base16_bytes()
}

export function ergoTreeToBytea(ergoTree: ErgoTree): Uint8Array {
    return wasm.ErgoTree.from_base16_bytes(ergoTree).to_bytes()
}
