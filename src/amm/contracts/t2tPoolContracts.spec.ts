import test from "ava"
import {RustModule} from "../../utils/rustLoader"
import {T2tPoolContracts, decimalToFractional} from "./t2tPoolContracts"

test.before(async () => {
  await RustModule.load(true)
})

test("Contract instantiation: Pool", async t => {
  t.notThrows(() => T2tPoolContracts.pool())
})

test("decimals to fractional", async t => {
  const numbers = [0.1, 0.01, 1.1, 1.01, 11.01]
  for (const i of numbers) {
    const [n, d] = decimalToFractional(i)
    t.deepEqual(i, Number(n) / Number(d))
  }
})
