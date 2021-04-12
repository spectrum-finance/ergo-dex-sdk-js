import {
    BoxValue,
    Contract,
    ErgoBoxCandidate as LibErgoBoxCandidate,
    ErgoBoxCandidateBuilder, I64
} from "ergo-lib-wasm-browser";
import {AssetAmount} from "../../entities/assetAmount";
import {Register} from "../../types";
import {Token} from "./token";

export class ErgoBoxCandidate {
    readonly value: bigint
    readonly contract: Contract
    readonly height: number

    readonly tokens: Token[]
    readonly registers: Register[]
    readonly tokenToMint?: AssetAmount

    constructor(
        value: bigint,
        contract: Contract,
        height: number,
        tokens?: Token[],
        registers?: Register[],
        tokenToMint?: AssetAmount
    ) {
        this.value = value
        this.contract = contract
        this.height = height
        this.tokens = tokens || []
        this.registers = registers || []
        this.tokenToMint = tokenToMint
    }

    toErgoLib(): LibErgoBoxCandidate {
        let builder = new ErgoBoxCandidateBuilder(
            BoxValue.from_i64(I64.from_str(this.value.toString())),
            this.contract,
            this.height
        )
        if (this.tokenToMint) {
            let token = this.tokenToMint.asset
            let libToken = this.tokenToMint.toErgoLib()
            builder.mint_token(
                libToken,
                token.name || "",
                token.description || "",
                token.decimals || 0
            )
        }
        for (let token of this.tokens) {
            let libToken = token.toErgoLib()
            builder.add_token(libToken.id(), libToken.amount())
        }
        for (let reg of this.registers) {
            builder.set_register_value(reg.id, reg.value)
        }
        return builder.build()
    }
}