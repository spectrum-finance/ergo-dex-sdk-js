import test from "ava"
import { swapVars } from "./swap"
import { AssetAmount } from "../../ergo"

test("Swap math", t => {
  const minDexFee = 10000000
  const nitro = 1.2
  const minOutput = new AssetAmount({ id: "btx" }, 200000000n)
  t.deepEqual(swapVars(minDexFee, nitro, minOutput), [
      0.05,
      {
        maxDexFee: 12000000,
        maxOutput: minOutput.withAmount(240000000n),
        minDexFee: 10000000,
        minOutput: minOutput
      }
    ]
  )
})
