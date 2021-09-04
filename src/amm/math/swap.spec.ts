import test from "ava"
import {AssetAmount} from "@ergolabs/ergo-sdk"
import {swapVars} from "./swap"

test("Swap math", t => {
  const minDexFee = 10000000n
  const nitro = 1.2
  const minOutput = new AssetAmount({id: "btx"}, 200000000n)
  t.deepEqual(swapVars(minDexFee, nitro, minOutput), [
    0.05,
    {
      maxDexFee: 12000000n,
      maxOutput: minOutput.withAmount(240000000n),
      minDexFee: 10000000n,
      minOutput: minOutput
    }
  ])
})

test("Swap math (adjustment required)", t => {
  const minDexFee = 10000000n
  const nitro = 1.2
  const minOutput = new AssetAmount({id: "btx"}, 20007399322n)
  t.deepEqual(swapVars(minDexFee, nitro, minOutput), [
    0.000499815085362147,
    {
      maxDexFee: 12000000n,
      maxOutput: minOutput.withAmount(24008879186n),
      minDexFee: 9999999n,
      minOutput: minOutput
    }
  ])
})
