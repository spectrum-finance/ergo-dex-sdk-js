import test from "ava"
import {AmmPool} from "./ammPool"
import {AssetAmount} from "../../ergo"

test("CFMM pool math", t => {
  const pool = initPool(1000000, 5000000)
  const inputX = new AssetAmount({id: "x"}, 1000n)
  const inputY = pool.depositAmount(inputX)
  const expectedY = new AssetAmount({id: "y"}, 5000n)
  t.deepEqual(inputY, expectedY)
  t.deepEqual(pool.depositAmount(inputY), inputX)
})

function initPool(inX: number, inY: number): AmmPool {
  const share = BigInt(Math.sqrt(inX * inY).toFixed(0))
  const lp = new AssetAmount({id: "lp"}, share)
  const x = new AssetAmount({id: "x"}, BigInt(inX))
  const y = new AssetAmount({id: "y"}, BigInt(inY))
  return new AmmPool("0x", lp, x, y, 997)
}
