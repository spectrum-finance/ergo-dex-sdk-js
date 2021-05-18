import {Contract} from "ergo-lib-wasm-browser";
import {ArbPoolBootScriptTemplate} from "./arbPoolBoot";
import {ArbPoolScriptTemplate} from "./arbPool";
import {PoolId} from "../types";
import {HexString, NErg, TokenId} from "../../wallet/types";
import {GenericDepositTemplate} from "./genericDeposit";
import {GenericRedeemTemplate} from "./genericRedeem";
import {ArbSwapTemplate} from "./arbSwap";
import {ErgoTree} from "../../wallet/entities/ergoTree";
import {PublicKey} from "../../wallet/entities/publicKey";

export class T2tPoolContracts {

    static poolBoot(emissionLP: bigint): ErgoTree {
        let script = ArbPoolBootScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script).ergo_tree().to_base16_bytes()
    }

    static pool(emissionLP: bigint): ErgoTree {
        let script = ArbPoolScriptTemplate.replace("$emissionLP", emissionLP.toString())
        return Contract.compile(script).ergo_tree().to_base16_bytes()
    }

    static deposit(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let script = GenericDepositTemplate
            .replace("$emissionLP", emissionLP.toString())
            .replace("$poolNFT", poolId.toString())
            .replace("$pk", pk)
            .replace("$dexFee", dexFee.toString())
        return Contract.compile(script).ergo_tree().to_base16_bytes()
    }

    static redeem(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let script = GenericRedeemTemplate
            .replace("$emissionLP", emissionLP.toString())
            .replace("$poolNFT", poolId.toString())
            .replace("$pk", pk)
            .replace("$dexFee", dexFee.toString())
        return Contract.compile(script).ergo_tree().to_base16_bytes()
    }

    static swap(
        poolScriptHash: HexString,
        poolFeeNum: number,
        quoteId: TokenId,
        minQuoteAmount: bigint,
        dexFeePerToken: NErg,
        pk: PublicKey
    ): ErgoTree {
        let script = ArbSwapTemplate
            .replace("$poolScriptHash", poolScriptHash)
            .replace("$poolFeeNum", poolFeeNum.toString())
            .replace("$quoteId", quoteId)
            .replace("$minQuoteAmount", minQuoteAmount.toString())
            .replace("$dexFeePerToken", dexFeePerToken.toString())
            .replace("$pk", pk)
        return Contract.compile(script).ergo_tree().to_base16_bytes()
    }
}