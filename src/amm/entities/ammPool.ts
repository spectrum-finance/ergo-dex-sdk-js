import {PoolId} from "../types";
import {HexString} from "../../wallet/types";
import {Eip4Token} from "../../wallet/entities/eip4Token";
import {Price} from "../../entities/price";
import {AssetAmount} from "../../wallet/entities/assetAmount";

export class AmmPool {
    constructor(
        public readonly id: PoolId,
        public readonly x: AssetAmount,
        public readonly y: AssetAmount,
        public readonly poolScriptHash: HexString,
        public readonly poolFeeNum: number
    ) {
    }

    private feeDenom: bigint = 1000n
    private feeNum: bigint = BigInt(this.poolFeeNum)

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
    inputAmount(output: AssetAmount, maxSlippage?: number): AssetAmount {
        let slippage = BigInt(maxSlippage || 0)
        if (output.asset === this.tokenX) {
            return this.y.mul(output).mul(this.feeDenom)
                .div(this.x.add(this.x.mul(slippage).div(100n)).sub(output).mul(this.feeNum))
                .add(1n)
        } else {
            return this.x.mul(output).mul(this.feeDenom)
                .div(this.y.add(this.x.mul(slippage).div(100n)).sub(output).mul(this.feeNum))
                .add(1n)
        }
    }

    /** @return Output amount of one token for a given input amount of the other
     */
    outputAmount(input: AssetAmount, maxSlippage?: number): AssetAmount {
        let slippage = BigInt(maxSlippage || 0)
        if (input.asset === this.tokenX) {
            return this.y.mul(input.mul(this.feeNum))
                .div(this.x.add(this.x.mul(slippage).div(100n)).mul(this.feeDenom).add(input.mul(this.feeNum)))
        } else {
            return this.x.mul(input.mul(this.feeNum))
                .div(this.y.add(this.y.mul(slippage).div(100n)).mul(this.feeDenom).add(input.mul(this.feeNum)))
        }
    }
}