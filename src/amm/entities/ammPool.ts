import {PoolId} from "../types"
import {AssetInfo, AssetAmount, HexString} from "../../ergo"
import {Price} from "../../entities/price"

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
    if (input.asset === this.assetX)
      return this.y.withAmount((input.amount * this.priceX.numerator) / this.priceX.denominator)
    else return this.x.withAmount((input.amount * this.priceY.numerator) / this.priceY.denominator)
  }

  /** @return Input amount of one token for a given output amount of the other
   */
  inputAmount(output: AssetAmount, maxSlippage?: number): AssetAmount | undefined {
    let slippage = BigInt(maxSlippage || 0)
    let minimalOutput = this.outputAmount(output).amount
    if (output.asset === this.assetX && minimalOutput > 0) {
      return this.y.withAmount(
        (this.y.amount * output.amount * this.feeDenom) /
          ((this.x.amount + (this.x.amount * slippage) / 100n - output.amount) * this.feeNum) +
          1n
      )
    } else if (output.asset === this.assetY && minimalOutput > 0) {
      return this.x.withAmount(
        (this.x.amount * output.amount * this.feeDenom) /
          ((this.y.amount + (this.y.amount * slippage) / 100n - output.amount) * this.feeNum) +
          1n
      )
    } else {
      return undefined
    }
  }

  /** @return Output amount of one token for a given input amount of the other
   */
  outputAmount(input: AssetAmount, maxSlippage?: number): AssetAmount {
    let slippage = BigInt(maxSlippage || 0)
    if (input.asset === this.assetX) {
      return this.y.withAmount(
        ((this.y.amount * input.amount * this.feeNum) / (this.x.amount + (this.x.amount * slippage) / 100n)) *
          this.feeDenom +
          input.amount * this.feeNum
      )
    } else {
      return this.x.withAmount(
        ((this.x.amount * input.amount * this.feeNum) / (this.y.amount + (this.y.amount * slippage) / 100n)) *
          this.feeDenom +
          input.amount * this.feeNum
      )
    }
  }
}
