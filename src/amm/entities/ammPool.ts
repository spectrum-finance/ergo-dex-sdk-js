import {PoolId} from "../types"
import {AssetInfo, AssetAmount} from "../../ergo"
import {Price} from "../../entities/price"
import {EmissionLP} from "../constants"

export class AmmPool {
  constructor(
    public readonly id: PoolId,
    public readonly lp: AssetAmount,
    public readonly x: AssetAmount,
    public readonly y: AssetAmount,
    public readonly poolFeeNum: number
  ) {}

  readonly feeDenom: bigint = 1000n
  readonly feeNum: bigint = BigInt(this.poolFeeNum)

  get supplyLP(): bigint {
    return EmissionLP - this.lp.amount
  }

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

  /** @return proportional amount of one token to a given input of the other
   */
  depositAmount(input: AssetAmount): AssetAmount {
    if (input.asset.id === this.assetX.id)
      return this.y.withAmount((input.amount * this.priceX.numerator) / this.priceX.denominator)
    else return this.x.withAmount((input.amount * this.priceY.numerator) / this.priceY.denominator)
  }

  /** @return pair of asset amounts proportional to a given input of LP tokens.
   */
  shares(input: AssetAmount): [AssetAmount, AssetAmount] {
    if (input.asset.id === this.lp.asset.id) {
      return [
        this.x.withAmount((input.amount * this.x.amount) / this.supplyLP),
        this.y.withAmount((input.amount * this.y.amount) / this.supplyLP)
      ]
    } else {
      return [this.x.withAmount(0n), this.y.withAmount(0n)]
    }
  }

  /** @return amount of LP asset proportional to the amounts of assets deposited.
   */
  rewardLP(inputX: AssetAmount, inputY: AssetAmount): AssetAmount {
    if (inputX.asset.id === this.x.asset.id && inputY.asset.id === this.y.asset.id) {
      const rewardXWise = (inputX.amount * this.supplyLP) / this.x.amount
      const rewardYWise = (inputY.amount * this.supplyLP) / this.y.amount
      return this.lp.withAmount(rewardXWise <= rewardYWise ? rewardXWise : rewardYWise)
    } else {
      return this.lp.withAmount(0n)
    }
  }

  /** @return Input amount of one token for a given output amount of the other
   */
  inputAmount(output: AssetAmount, maxSlippage?: number): AssetAmount | undefined {
    let slippage = BigInt((maxSlippage || 0) * 100)
    let minimalOutput = this.outputAmount(output).amount
    if (output.asset.id === this.assetX.id && minimalOutput > 0 && output.amount <= this.x.amount) {
      return this.y.withAmount(
        (this.y.amount * output.amount * this.feeDenom) /
          ((this.x.amount + (this.x.amount * slippage) / (100n * 100n) - output.amount) * this.feeNum) +
          1n
      )
    } else if (output.asset.id === this.assetY.id && minimalOutput > 0 && output.amount <= this.y.amount) {
      return this.x.withAmount(
        (this.x.amount * output.amount * this.feeDenom) /
          ((this.y.amount + (this.y.amount * slippage) / (100n * 100n) - output.amount) * this.feeNum) +
          1n
      )
    } else {
      return undefined
    }
  }

  /** @param input - swap input
   *  @param maxSlippage - max price slippage allowed % (0 - 100)
   *  @return Output amount of one token for a given input amount of the other
   */
  outputAmount(input: AssetAmount, maxSlippage?: number): AssetAmount {
    let slippage = BigInt((maxSlippage || 0) * 100)
    if (input.asset.id === this.assetX.id)
      return this.y.withAmount(
        (this.y.amount * input.amount * this.feeNum) /
          ((this.x.amount + (this.x.amount * slippage) / (100n * 100n)) * this.feeDenom +
            input.amount * this.feeNum)
      )
    else
      return this.x.withAmount(
        (this.x.amount * input.amount * this.feeNum) /
          ((this.y.amount + (this.y.amount * slippage) / (100n * 100n)) * this.feeDenom +
            input.amount * this.feeNum)
      )
  }
}
