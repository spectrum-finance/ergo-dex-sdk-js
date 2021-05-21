import {BoxSelection} from "./boxSelection";
import {ErgoBoxCandidate} from "./ergoBoxCandidate";
import {Address} from "./address";
import {TxId} from "../types";
import * as interop from "./../ergoWasmInterop";
import * as wasm from "ergo-lib-wasm-browser";
import {I64} from "ergo-lib-wasm-browser";

export class ErgoTxCandidate {
    readonly id: TxId
    readonly inputs: BoxSelection
    readonly outputs: ErgoBoxCandidate[]
    readonly height: number
    readonly feeNErgs: bigint
    readonly changeAddress: Address

    constructor(
        id: TxId,
        inputs: BoxSelection,
        outputs: ErgoBoxCandidate[],
        height: number,
        feeNErgs: bigint,
        changeAddress: Address
    ) {
        this.id = id
        this.inputs = inputs
        this.outputs = outputs
        this.height = height
        this.feeNErgs = feeNErgs
        this.changeAddress = changeAddress
    }

    static make(
        inputs: BoxSelection,
        outputs: ErgoBoxCandidate[],
        height: number,
        feeNErgs: bigint,
        changeAddress: Address
    ): ErgoTxCandidate {
        let selection = interop.boxSelectionToWasm(inputs)
        let candidates = interop.boxCandidatesToWasm(outputs)
        let fee = wasm.BoxValue.from_i64(I64.from_str(feeNErgs.toString()))
        let wasmAddr = wasm.Address.from_base58(changeAddress)
        let builder = wasm.TxBuilder.new(selection, candidates, height, fee, wasmAddr, wasm.BoxValue.SAFE_USER_MIN())
        let txId = builder.build().id().to_str()
        return new ErgoTxCandidate(txId, inputs, outputs, height, feeNErgs, changeAddress)
    }
}