import {HexString} from "../types";
import {ErgoTree} from "./ergoTree";
import * as wasm from "ergo-lib-wasm-browser"
import {toHex} from "../../utils/hex";

export type ErgoTreeTemplate = HexString

export function fromErgoTree(tree: ErgoTree): ErgoTreeTemplate {
    return toHex(wasm.ErgoTree.from_base16_bytes(tree).template_bytes())
}
