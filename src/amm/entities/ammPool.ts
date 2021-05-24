import {PoolId} from "../types";
import {HexString} from "../../wallet/types";
import {AssetInfo, AssetAmount} from "../../wallet";
import {Price} from "../../entities/price";

export class AmmPool {
    constructor(
        public readonly id: PoolId,
        public readonly x: AssetAmount,
        public readonly y: AssetAmount,
        public readonly poolScriptHash: HexString,
        public readonly poolFeeNum: number
    ) {}

    private feeDenom: bigint = 1000n
    private feeNum: bigint = BigInt(this.poolFeeNum)

    get assetX(): AssetInfo {
        return this.x.asset
    }

    get assetY(): AssetInfo {
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
        let price = input.asset === this.assetX ? this.priceX : this.priceY
        return input.mul(price.numerator).div(price.denominator)
    }

    /** @return Input amount of one token for a given output amount of the other
     */
    inputAmount(output: AssetAmount, maxSlippage?: number): AssetAmount | undefined {
        let slippage = BigInt(maxSlippage || 0)
        let minimalOutput = this.outputAmount(output).amount
        if (output.asset === this.assetX && minimalOutput > 0) {
            return this.y.mul(output).mul(this.feeDenom)
                .div(this.x.add(this.x.mul(slippage).div(100n)).sub(output).mul(this.feeNum))
                .add(1n)
        } else if (output.asset === this.assetY && minimalOutput > 0) {
            return this.x.mul(output).mul(this.feeDenom)
                .div(this.y.add(this.x.mul(slippage).div(100n)).sub(output).mul(this.feeNum))
                .add(1n)
        } else {
            return undefined
        }
    }

    /** @return Output amount of one token for a given input amount of the other
     */
    outputAmount(input: AssetAmount, maxSlippage?: number): AssetAmount {
        let slippage = BigInt(maxSlippage || 0)
        if (input.asset === this.assetX) {
            return this.y.mul(input.mul(this.feeNum))
                .div(this.x.add(this.x.mul(slippage).div(100n)).mul(this.feeDenom).add(input.mul(this.feeNum)))
        } else {
            return this.x.mul(input.mul(this.feeNum))
                .div(this.y.add(this.y.mul(slippage).div(100n)).mul(this.feeDenom).add(input.mul(this.feeNum)))
        }
    }
}