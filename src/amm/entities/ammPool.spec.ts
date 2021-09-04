import test from "ava"
import {AssetAmount} from "ergo-sdk"
import {AmmPool} from "./ammPool"
import {sqrt} from "../../utils/sqrt"

export class PoolEmulation {
  constructor(public readonly pool: AmmPool) {}

  swapPossible(input: AssetAmount, minOutput: AssetAmount): boolean {
    const [baseR, quoteR] =
      input.asset.id === this.pool.assetX.id
        ? [this.pool.x.amount, this.pool.y.amount]
        : [this.pool.y.amount, this.pool.x.amount]
    const deltaQuoteStrict = this.pool.outputAmount(input, 0)

    const poolRequirementsSatisfied =
      quoteR * input.amount * this.pool.feeNum >=
      deltaQuoteStrict.amount * (baseR * this.pool.feeDenom + input.amount * this.pool.feeNum)

    const swapRequirementSatisfied =
      quoteR * input.amount * this.pool.feeNum <=
        (deltaQuoteStrict.amount + 1n) * (baseR * this.pool.feeDenom + input.amount * this.pool.feeNum) &&
      deltaQuoteStrict >= minOutput

    return poolRequirementsSatisfied && swapRequirementSatisfied
  }
}

const pool = initPool(1000000n, 5000000n)
const emul0 = new PoolEmulation(pool)

test("Pool math (depositAmount, X -> Y)", t => {
  const inputX = new AssetAmount({id: "x"}, 1000n)
  const inputY = pool.depositAmount(inputX)
  const expectedY = new AssetAmount({id: "y"}, 5000n)
  t.deepEqual(inputY, expectedY)
  t.deepEqual(pool.depositAmount(inputY), inputX)
})

test("Pool math (depositAmount, Y -> X)", t => {
  const inputY = new AssetAmount({id: "y"}, 1000n)
  const inputX = pool.depositAmount(inputY)
  const expectedY = new AssetAmount({id: "x"}, 200n)
  t.deepEqual(inputX, expectedY)
  t.deepEqual(pool.depositAmount(inputX), inputY)
})

test("Pool math (outputAmount, X -> Y, 0% slippage)", t => {
  const inputX = new AssetAmount({id: "x"}, 1000n)
  const outputY = pool.outputAmount(inputX, 0)
  const expectedY = new AssetAmount({id: "y"}, 4980n)
  t.deepEqual(outputY, expectedY)
  t.true(emul0.swapPossible(inputX, outputY))
})

test("Pool math (inputAmount, X -> Y, 0% slippage)", t => {
  const outputX = new AssetAmount({id: "x"}, 1000n)
  const inputY = pool.inputAmount(outputX, 0)
  const expectedY = new AssetAmount({id: "y"}, 5021n)
  t.deepEqual(inputY, expectedY)
  t.true(emul0.swapPossible(inputY!, outputX))
})

test("Pool math (outputAmount, Y -> X, 0% slippage)", t => {
  const inputY = new AssetAmount({id: "y"}, 1000n)
  const outputX = pool.outputAmount(inputY, 0)
  const expectedX = new AssetAmount({id: "x"}, 199n)
  t.deepEqual(outputX, expectedX)
  t.true(emul0.swapPossible(inputY, outputX))
})

test("Pool math (outputAmount, X -> Y, 5% slippage)", t => {
  const inputX = new AssetAmount({id: "x"}, 1000n)
  const outputY = pool.outputAmount(inputX, 5)
  const expectedY = new AssetAmount({id: "y"}, 4743n)
  t.deepEqual(outputY, expectedY)
  t.true(emul0.swapPossible(inputX, outputY))
})

test("Pool math (outputAmount, Y -> X, 5% slippage)", t => {
  const inputY = new AssetAmount({id: "y"}, 1000n)
  const outputX = pool.outputAmount(inputY, 5)
  const expectedX = new AssetAmount({id: "x"}, 189n)
  t.deepEqual(outputX, expectedX)
  t.true(emul0.swapPossible(inputY, outputX))
})

function initPool(inX: bigint, inY: bigint): AmmPool {
  const share = sqrt(inX * inY)
  const lp = new AssetAmount({id: "lp"}, share)
  const x = new AssetAmount({id: "x"}, BigInt(inX))
  const y = new AssetAmount({id: "y"}, BigInt(inY))
  return new AmmPool("0x", lp, x, y, 997)
}
