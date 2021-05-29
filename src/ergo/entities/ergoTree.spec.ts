import test from "ava";
import {RustModule} from "../../utils/rustLoader";
import {ergoTreeFromAddress} from "./ergoTree";

test.before(async () => {
    await RustModule.load("ergo-lib-wasm-nodejs")
})

test("ergoTreeFromAddress", async (t) => {
    t.is(
        ergoTreeFromAddress("9gPGo71icAXpgd44A688VqwC9ePKHAtMG1gvaZKV8daJy2AkEVC"),
        "0008cd02f5b53e746b83c3a12b0ee1ecfd14be592347a9a1834caa04f8341e5559d2ffce"
    )
})
