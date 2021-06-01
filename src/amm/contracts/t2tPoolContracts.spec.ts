import test from "ava";
import {RustModule} from "../../utils/rustLoader";
import {T2tPoolContracts} from "./t2tPoolContracts";

test.before(async () => {
    await RustModule.load(true)
})

test("Contract instantiation: Pool", async (t) => {
    t.notThrows(() => T2tPoolContracts.pool(1000000000000000000n))
})
