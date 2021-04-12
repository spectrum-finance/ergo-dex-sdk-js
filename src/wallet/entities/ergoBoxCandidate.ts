import {
    BoxValue,
    Contract,
    ErgoBoxCandidate as LibErgoBoxCandidate,
    Token as LibToken,
    ErgoBoxCandidateBuilder, I64, TokenId, TokenAmount
} from "ergo-lib-wasm-browser";
import {Register} from "../../types";
import {Token} from "./token";
import {MintToken} from "../types";

export class ErgoBoxCandidate {
    readonly value: bigint
    readonly contract: Contract
    readonly height: number

    readonly tokens: Token[]
    readonly registers: Register[]
    readonly tokenToMint?: MintToken

    constructor(
        value: bigint,
        contract: Contract,
        height: number,
        tokens?: Token[],
        registers?: Register[],
        tokenToMint?: MintToken
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
            let [token, amount] = [this.tokenToMint.token, this.tokenToMint.amount]
            let libToken = new LibToken(
                TokenId.from_str(token.id),
                TokenAmount.from_i64(I64.from_str(amount.toString()))
            )
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
            builder.set_register_value(reg.id, reg.value.toErgoLib())
        }
        return builder.build()
    }
}