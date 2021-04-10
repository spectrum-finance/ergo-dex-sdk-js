import {Contract} from "ergo-lib-wasm-browser";
import {ArbPoolBootScriptTemplate} from "./arbPoolBoot";
import {ArbPoolScriptTemplate} from "./arbPool";

export class ArbPoolContracts {

    static arbPoolBootScript(emissionLP: bigint): Contract {
        let script = ArbPoolBootScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script)
    }

    static arbPoolScript(emissionLP: bigint): Contract {
        let script = ArbPoolScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script)
    }
}