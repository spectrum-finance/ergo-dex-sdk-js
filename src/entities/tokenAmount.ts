import {Token} from "./token";

export class TokenAmount {
    readonly token: Token
    readonly amount: bigint

    constructor(token: Token, amount: bigint) {
        this.token = token
        this.amount = amount
    }

    withAmount(amount: bigint): TokenAmount {
        return new TokenAmount(this.token, amount)
    }

    add(n: bigint | TokenAmount): TokenAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount + n)
        } else {
            return this.withAmount(this.amount + n.amount)
        }
    }

    sub(n: bigint | TokenAmount): TokenAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount - n)
        } else {
            return this.withAmount(this.amount - n.amount)
        }
    }

    mul(n: bigint | TokenAmount): TokenAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount * n)
        } else {
            return this.withAmount(this.amount * n.amount)
        }
    }

    div(n: bigint | TokenAmount): TokenAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount / n)
        } else {
            return this.withAmount(this.amount / n.amount)
        }
    }
}