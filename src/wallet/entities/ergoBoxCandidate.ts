import {
    BoxValue,
    Contract,
    ErgoBoxCandidate as LibErgoBoxCandidate,
    ErgoBoxCandidateBuilder, I64
} from "ergo-lib-wasm-browser";
import {TokenAmount} from "../../entities/tokenAmount";
import {Register} from "../../types";

export class ErgoBoxCandidate {
    readonly value: bigint
    readonly contract: Contract
    readonly height: number

    readonly tokenToMint?: TokenAmount
    readonly tokens: TokenAmount[]
    readonly registers: Register[]

    constructor(
        value: bigint,
        contract: Contract,
        height: number,
        tokenToMint?: TokenAmount,
        tokens?: TokenAmount[],
        registers?: Register[]
    ) {
        this.value = value
        this.contract = contract
        this.height = height
        this.tokenToMint = tokenToMint
        this.tokens = tokens || []
        this.registers = registers || []
    }

    toErgoLib(): LibErgoBoxCandidate {
        let builder = new ErgoBoxCandidateBuilder(
            BoxValue.from_i64(I64.from_str(this.value.toString())),
            this.contract,
            this.height
        )
        if (this.tokenToMint) {
            let token = this.tokenToMint.token
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