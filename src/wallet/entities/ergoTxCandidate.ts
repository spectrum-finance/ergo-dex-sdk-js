import {BoxSelection} from "./boxSelection";
import {Address, UnsignedTransaction, TxBuilder, BoxValue, I64, ErgoBoxCandidates} from "ergo-lib-wasm-browser";
import {ErgoBoxCandidate} from "./ergoBoxCandidate";

export class ErgoTxCandidate {
    readonly inputs: BoxSelection
    readonly outputs: ErgoBoxCandidate[]
    readonly height: number
    readonly feeNErgs: bigint
    readonly changeAddress: Address

    constructor(
        inputs: BoxSelection,
        outputs: ErgoBoxCandidate[],
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
        let libInputs = this.inputs.toErgoLib()
        let libOutputs = new ErgoBoxCandidates(this.outputs[0].toErgoLib())
        for (let c of this.outputs.slice(1)) libOutputs.add(c.toErgoLib())
        let builder = TxBuilder.new(
            libInputs,
            libOutputs,
            this.height,
            fee,
            this.changeAddress,
            TxBuilder.SUGGESTED_TX_FEE()
        )
        return builder.build()
    }
}