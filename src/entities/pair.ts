import {TokenAmount} from "./tokenAmount";
import {Price} from "./price";
import {Token} from "./token";

export class Pair {
    readonly x: TokenAmount
    readonly y: TokenAmount

    constructor(x: TokenAmount, y: TokenAmount) {
        this.x = x
        this.y = y
    }

    get tokenX(): Token {
        return this.x.token
    }

    get tokenY(): Token {
        return this.y.token
    }

    /** @return Price of tokenX in tokenY units.
     */
    get priceX(): Price {
        return new Price(this.y.amount, this.x.amount)
    }

    /** @return Price of tokenY in tokenX units.
     */
    get priceY(): Price {
        return new Price(this.x.amount, this.y.amount)
    }

    /** @return Proportional amount of one token to a given input of the other
     */
    inputAmount(input: TokenAmount): TokenAmount {
        let price = input.token === this.tokenX ? this.priceX : this.priceY
        return input.mul(price.numerator).div(price.denominator)
    }

    /** @return Output amount of one token for a given input amount of the other
     */
    outputAmount(inputAmount: TokenAmount): TokenAmount {
        if (inputAmount.token === this.tokenX) {
            return this.y.mul(inputAmount).div(this.x.add(inputAmount))
        } else {
            return this.x.mul(inputAmount).div(this.y.add(inputAmount))
        }
    }
}