import {BoxSelection} from "./boxSelection";
import {Address, UnsignedTransaction, TxBuilder, BoxValue, I64} from "ergo-lib-wasm-browser";
import {OutputCandidates} from "./outputCandidates";

export class ErgoTxCandidate {
    readonly inputs: BoxSelection
    readonly outputs: OutputCandidates
    readonly height: number
    readonly feeNErgs: bigint
    readonly changeAddress: Address

    constructor(
        inputs: BoxSelection,
        outputs: OutputCandidates,
        height: number,
        feeNErgs: bigint,
        changeAddress: Address
    ) {
        this.inputs = inputs
        this.outputs = outputs
        this.height = height
        this.feeNErgs = feeNErgs
        this.changeAddress = changeAddress
    }

    toErgoLib(): UnsignedTransaction {
        let fee = BoxValue.from_i64(I64.from_str(this.feeNErgs.toString()))
        let builder = TxBuilder.new(
            this.inputs.toErgoLib(),
            this.outputs.toErgoLib(),
            this.height,
            fee,
            this.changeAddress,
            TxBuilder.SUGGESTED_TX_FEE()
        )
        return builder.build()
    }
}