import {ErgoTreeHex, ErgoTreeTemplateHashHex} from "../types";
import {ErgoBox} from "ergo-lib-wasm-browser";

export interface Explorer {

    /** Get unspent boxes with a given ErgoTree.
     */
    getUnspentByErgoTree(tree: ErgoTreeHex): ErgoBox[]

    /** Get unspent boxes with scripts matching a given template hash.
     */
    getUnspentByErgoTreeTemplate(templateHash: ErgoTreeTemplateHashHex): ErgoBox[]
}