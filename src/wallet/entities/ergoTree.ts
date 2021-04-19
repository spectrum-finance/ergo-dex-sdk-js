import {HexString} from "../types";
import {Address as LibAddress, ErgoTree as LibErgoTreee} from "ergo-lib-wasm-browser";
import {Address} from "./address";

export type ErgoTree = HexString

export function ergoTreeFromAddress(addr: Address): ErgoTree {
    return LibAddress.from_base58(addr).to_ergo_tree().to_base16_bytes()
}

export function ergoTreeToBytea(ergoTree: ErgoTree): Uint8Array {
    return LibErgoTreee.from_base16_bytes(ergoTree).to_bytes()
}
