import test from "ava"
import {decimalToFractional} from "../../utils/math"
import {RustModule} from "../../utils/rustLoader"
import * as T2T from "./t2tPoolContracts"

test.before(async () => {
  await RustModule.load(true)
})

test("Contract template hash calculation: Pool", async t => {
  t.deepEqual(
    T2T.poolTemplateHash(),
    "3c09deff3b5f49329149d18e02aab675ef6957bf6559a5c7dba817fee883fb3e"
  )
})

test("decimals to fractional", async t => {
  const numbers = [0.1, 0.01, 1.1, 1.01, 11.01, 1.0, 1, 121212.12121212122, 7.464261489131828e-7]
  for (const i of numbers) {
    const [n, d] = decimalToFractional(i)
    t.deepEqual(i, Number(n) / Number(d))
  }
})
