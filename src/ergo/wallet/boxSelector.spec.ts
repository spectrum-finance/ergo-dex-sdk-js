import test from "ava"
import {RustModule} from "../../utils/rustLoader"
import {DefaultBoxSelector} from "./boxSelector"
import {InsufficientInputs} from "../errors/insufficientInputs"
import {boxes, boxesWithAssets} from "../samples"
import {BoxSelection} from "./entities/boxSelection"

test.before(async () => {
  await RustModule.load(true)
})

test("BoxSelector: Insufficient inputs", async t =>
  t.deepEqual(
    DefaultBoxSelector.select([], {
      nErgs: 100,
      assets: []
    }),
    new InsufficientInputs("'NErgs' required: 100, given: 0")
  ))

test("BoxSelector: Select ERGs", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxes, {
      nErgs: 39999500000,
      assets: []
    }),
    BoxSelection.make(boxes, {value: 59999200000, assets: []})
  ))

test("BoxSelector: Select ERGs and assets (+ irrelevant tokens in inputs)", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxesWithAssets, {
      nErgs: 39999500000,
      assets: [{tokenId: "x", amount: 10}]
    }),
    BoxSelection.make(boxesWithAssets, {
      value: 59999200000,
      assets: [
        {tokenId: "x", amount: 140},
        {tokenId: "y", amount: 500}
      ]
    })
  ))
