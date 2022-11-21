import {AssetAmount} from "@ergolabs/ergo-sdk"
import test from "ava"
import {LmPool} from "./lmPool"

test("Epochs left (unit epoch)", t => {
  const startedAt = 1000
  const pool = initPool(1, 10, startedAt)
  const diff = 5
  t.deepEqual(pool.epochsLeft(startedAt + diff), diff)
})

test("Epochs left", t => {
  const startedAt = 1000
  const pool = initPool(4, 10, startedAt)
  const diff = 5
  t.deepEqual(pool.epochsLeft(startedAt + diff), 8)
})

function initPool(epochLen: number, epochNum: number, programStart: number): LmPool {
  const reward = new AssetAmount({id: "rew"}, 1000000000n)
  const lq = new AssetAmount({id: "lq"}, 1000000000n)
  const vlq = new AssetAmount({id: "vlq"}, 1000000000n)
  const tt = new AssetAmount({id: "tt"}, 1000000000n)
  const conf = {
    epochLen,
    epochNum,
    programStart,
    programBudget: reward.amount,
    execBudget: 100000000n
  }
  return new LmPool("0x", conf, reward, lq, vlq, tt)
}
