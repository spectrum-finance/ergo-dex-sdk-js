import {AssetAmount} from "../../wallet/entities/assetAmount";
import {Price} from "../../entities/price";
import {Eip4Token} from "../../wallet/entities/eip4Token";

export class Pair {
    readonly x: AssetAmount
    readonly y: AssetAmount

    constructor(x: AssetAmount, y: AssetAmount) {
        this.x = x
        this.y = y
    }

    get tokenX(): Eip4Token {
        return this.x.asset
    }

    get tokenY(): Eip4Token {
        return this.y.asset
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
    depositAmount(input: AssetAmount): AssetAmount {
        let price = input.asset === this.tokenX ? this.priceX : this.priceY
        return input.mul(price.numerator).div(price.denominator)
    }

    /** @return Input amount of one token for a given output amount of the other
     */
    inputAmount(output: AssetAmount): AssetAmount {
        if (output.asset === this.tokenX) {
            return this.y.mul(output).mul(1000n).div(this.x.sub(output).mul(997n)).add(1n)
        } else {
            return this.x.mul(output).mul(1000n).div(this.y.sub(output).mul(997n)).add(1n)
        }
    }

    /** @return Output amount of one token for a given input amount of the other
     */
    outputAmount(input: AssetAmount): AssetAmount {
        if (input.asset === this.tokenX) {
            return this.y.mul(input.mul(997n)).div(this.x.mul(1000n).add(input.mul(997n)))
        } else {
            return this.x.mul(input.mul(997n)).div(this.y.mul(1000n).add(input.mul(997n)))
        }
    }
}