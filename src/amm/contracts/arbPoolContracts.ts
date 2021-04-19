import {Contract} from "ergo-lib-wasm-browser";
import {ArbPoolBootScriptTemplate} from "./arbPoolBoot";
import {ArbPoolScriptTemplate} from "./arbPool";
import {PoolId} from "../types";
import {HexString, NErg, PublicKey, TokenId} from "../../wallet/types";
import {GenericDepositTemplate} from "./genericDeposit";
import {GenericRedeemTemplate} from "./genericRedeem";
import {ArbSwapTemplate} from "./arbSwap";

export class ArbPoolContracts {

    static arbPoolBootScript(emissionLP: bigint): Contract {
        let script = ArbPoolBootScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script)
    }

    static arbPoolScript(emissionLP: bigint): Contract {
        let script = ArbPoolScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script)
    }

    static genericDepositScript(emissionLP: bigint, poolId: PoolId, pk: PublicKey): Contract {
        let script = GenericDepositTemplate
            .replace("$emissionLP", emissionLP.toString())
            .replace("$poolNFT", poolId.toString())
            .replace("$pk", pk)
        return Contract.compile(script)
    }

    static genericRedeemScript(emissionLP: bigint, poolId: PoolId, pk: PublicKey): Contract {
        let script = GenericRedeemTemplate
            .replace("$emissionLP", emissionLP.toString())
            .replace("$poolNFT", poolId.toString())
            .replace("$pk", pk)
        return Contract.compile(script)
    }

    static swapScript(
        poolScriptHash: HexString,
        poolFeeNum: number,
        quoteId: TokenId,
        minQuoteAmount: bigint,
        dexFeePerToken: NErg,
        pk: PublicKey
    ): Contract {
        let script = ArbSwapTemplate
            .replace("$poolScriptHash", poolScriptHash)
            .replace("$poolFeeNum", poolFeeNum.toString())
            .replace("$quoteId", quoteId)
            .replace("$minQuoteAmount", minQuoteAmount.toString())
            .replace("$dexFeePerToken", dexFeePerToken.toString())
            .replace("$pk", pk)
        return Contract.compile(script)
    }
}