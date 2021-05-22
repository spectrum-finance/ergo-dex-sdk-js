import {BoxSelection} from "./boxSelection";
import {ErgoBoxCandidate} from "./ergoBoxCandidate";
import {Address} from "./address";
import {TxId} from "../types";
import * as interop from "./../ergoWasmInterop";
import * as wasm from "ergo-lib-wasm-browser";
import {I64} from "ergo-lib-wasm-browser";

export class ErgoTxCandidate {

    constructor(
        public readonly id: TxId,
        public readonly inputs: BoxSelection,
        public readonly outputs: ErgoBoxCandidate[],
        public readonly height: number,
        public readonly feeNErgs: bigint,
        public readonly changeAddress: Address
    ) {}

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