import * as wasm from "ergo-lib-wasm-browser";
import {I64} from "ergo-lib-wasm-browser";
import {BoxSelection} from "./entities/boxSelection";
import {ErgoBox} from "./entities/ergoBox";
import {ErgoTree, ergoTreeToBytea} from "./entities/ergoTree";
import {Token} from "./entities/token";
import {ErgoBoxCandidate} from "./entities/ergoBoxCandidate";
import {Int32Constant, Int64Constant} from "./entities/constant";
import {RegisterId} from "./entities/registers";

export function boxSelectionToWasm(inputs: BoxSelection): wasm.BoxSelection {
    let boxes = new wasm.ErgoBoxes(boxToWasm(inputs.boxes[0]))
    let tokens = new wasm.Tokens()
    let changeList = new wasm.ErgoBoxAssetsDataList()
    if (inputs.change) {
        inputs.change.tokens.forEach((v, k, _xs) => {
            let t = new wasm.Token(wasm.TokenId.from_str(k), wasm.TokenAmount.from_i64(I64.from_str(v.toString())))
            tokens.add(t)
        })
        let change = new wasm.ErgoBoxAssetsData(wasm.BoxValue.from_i64(I64.from_str(inputs.change.value.toString())), tokens)
        for (let box of inputs.boxes.slice(1)) boxes.add(boxToWasm(box))
        changeList.add(change)
    }
    return new wasm.BoxSelection(boxes, changeList)
}

export function boxCandidatesToWasm(boxes: ErgoBoxCandidate[]): wasm.ErgoBoxCandidates {
    let candidates = wasm.ErgoBoxCandidates.empty()
    for (let box of boxes) candidates.add(boxCandidateToWasm(box))
    return candidates
}

export function boxCandidateToWasm(box: ErgoBoxCandidate): wasm.ErgoBoxCandidate {
    let value = wasm.BoxValue.from_i64(I64.from_str(box.value.toString()))
    let contract = wasm.Contract.pay_to_address(wasm.Address.recreate_from_ergo_tree(ergoTreeToWasm(box.ergoTree)))
    let builder = new wasm.ErgoBoxCandidateBuilder(value, contract, box.height)
    if (box.tokenToMint) {
        let token = box.tokenToMint.token
        let id = wasm.TokenId.from_str(token.id)
        let amount = wasm.TokenAmount.from_i64(I64.from_str(box.tokenToMint.amount.toString()))
        let wasmToken = new wasm.Token(id, amount)
        builder.mint_token(wasmToken, token.name || "", token.description || "", token.decimals || 0)
    }
    for (let token of box.tokens) {
        let t = tokenToWasm(token)
        builder.add_token(t.id(), t.amount())
    }
    for (let [id, value] of box.registers) {
        let constant: wasm.Constant
        if (value instanceof Int32Constant)
            constant = wasm.Constant.from_i32(value.value)
        else if (value instanceof Int64Constant)
            constant = wasm.Constant.from_i64(I64.from_str(value.value.toString()))
        else
            constant = wasm.Constant.from_byte_array(value.value)
        builder.set_register_value(registerIdToWasm(id), constant)
    }
    return builder.build()
}

export function registerIdToWasm(id: RegisterId): number {
    return Number(id[1])
}

export function boxToWasm(box: ErgoBox): wasm.ErgoBox {
    let value = wasm.BoxValue.from_i64(I64.from_str(box.value.toString()))
    let contract = wasm.Contract.pay_to_address(wasm.Address.recreate_from_ergo_tree(ergoTreeToWasm(box.ergoTree)))
    let txId = wasm.TxId.from_str(box.txId)
    let tokens = tokensToWasm(box.tokens)
    return new wasm.ErgoBox(value, box.creationHeight, contract, txId, box.index, tokens)
}

export function ergoTreeToWasm(tree: ErgoTree): wasm.ErgoTree {
    return wasm.ErgoTree.from_bytes(ergoTreeToBytea(tree))
}

export function tokenToWasm(token: Token): wasm.Token {
    let id = wasm.TokenId.from_str(token.tokenId)
    let amount = wasm.TokenAmount.from_i64(I64.from_str(token.amount.toString()))
    return new wasm.Token(id, amount)
}

export function tokensToWasm(tokens: Token[]): wasm.Tokens {
    let bf = new wasm.Tokens()
    for (let t of tokens) bf.add(tokenToWasm(t))
    return bf
}
