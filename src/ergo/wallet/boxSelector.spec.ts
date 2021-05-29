import test from "ava";
import {RustModule} from "../../utils/rustLoader";
import {DefaultBoxSelector} from "./boxSelector";
import {InsufficientInputs} from "../errors/insufficientInputs";

test.before(async () => {
    await RustModule.load("ergo-lib-wasm-nodejs")
})

test("BoxSelector: Insufficient inputs", async (t) =>
    t.deepEqual(DefaultBoxSelector.select([], {
        nErgs: 100n,
        assets: []
    }), new InsufficientInputs("'NErgs' required: 100, given: 0"))
)
