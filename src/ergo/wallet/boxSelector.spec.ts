import test from "ava";
import {RustModule} from "../../utils/rustLoader";
import {DefaultBoxSelector} from "./boxSelector";
import {InsufficientInputs} from "../errors/insufficientInputs";
import {boxes} from "../samples";
import {BoxSelection} from "./entities/boxSelection";

test.before(async () => {
    await RustModule.load("ergo-lib-wasm-nodejs")
})

test("BoxSelector: Insufficient inputs", async (t) =>
    t.deepEqual(DefaultBoxSelector.select([], {
        nErgs: 100n,
        assets: []
    }), new InsufficientInputs("'NErgs' required: 100, given: 0"))
)

test("BoxSelector: Select ERGs", async (t) =>
    t.deepEqual(DefaultBoxSelector.select(boxes, {
        nErgs: 39999500000n,
        assets: []
    }), BoxSelection.make(boxes, {value: 59999200000n, assets: []}))
)
