import {PoolSetupParams} from "../models/poolSetupParams";
import {Constant, I64, TokenId} from "ergo-lib-wasm-browser";
// @ts-ignore
import * as blake from "blakejs";
import {PoolId} from "../types";
import {SwapParams} from "../models/swapParams";
import {notImplemented} from "../../utils/notImplemented";
import {ArbPoolContracts} from "../contracts/arbPoolContracts";
import {EmissionLP} from "../constants";
import {InsufficientInputs} from "../../wallet/errors/insufficientInputs";
import {TransactionContext} from "../../wallet/models/transactionContext";
import {TokenAmount} from "../../entities/tokenAmount";
import {Token} from "../../entities/token";
import {ErgoBoxCandidate} from "../../wallet/entities/ergoBoxCandidate";
import {ErgoTxCandidate} from "../../wallet/entities/ergoTxCandidate";
import {OutputCandidates} from "../../wallet/entities/outputCandidates";
import {ErgoTxChainCandidate} from "../../wallet/entities/ergoTxChainCandidate";

export interface PoolOpsInterpreter {

    /** Interpret `setup` operation on a pool to a chain of transactions.
     */
    setup(params: PoolSetupParams, ctx: TransactionContext): ErgoTxChainCandidate | InsufficientInputs

    /** Interpret `deposit` operation on a pool to a transaction.
     */
    deposit(poolId: PoolId, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs

    /** Interpret `redeem` operation on a pool to a transaction.
     */
    redeem(poolId: PoolId, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs

    /** Interpret `swap` operation on a pool to a transaction.
     */
    swap(poolId: PoolId, params: SwapParams, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs
}

export class PoolOpsInterpreterImpl implements PoolOpsInterpreter {

    setup(params: PoolSetupParams, ctx: TransactionContext): ErgoTxChainCandidate | InsufficientInputs {
        let pair = [params.x.token, params.y.token]
        let inputs = ctx.inputs
        let outputGranted = inputs.totalOutputWithoutChange()
        let ergsIn = outputGranted.nErgs - ctx.feeNErgs
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.token === pair[0]),
            outputGranted.tokens.filter((t, _i, _xs) => t.token === pair[1])
        ].flat()
        if (pairIn.length == 2) {
            let tokenIdLP = TokenId.from_box_id(inputs.head.box_id())
            let tokenTickerLP = `${pair[0].name}_${pair[1].name}_LP`
            let tokenDescriptionLP = `${pair[0].name}|${pair[1].name} AMM Pool LP tokens`
            let tokenDecimalsLP = 0
            let tokenLP = new Token(tokenIdLP, tokenTickerLP, tokenDecimalsLP, tokenDescriptionLP)
            let tokenAmountLP = new TokenAmount(tokenLP, EmissionLP)
            let poolSH: Uint8Array = notImplemented()
            let registers = [
                {id: 4, value: Constant.from_byte_array(poolSH)},
                {id: 5, value: Constant.from_i64(I64.from_str(params.outputShare.toString()))},
                {id: 6, value: Constant.from_i32(params.feeNumerator)}]
            let proxyOut = new ErgoBoxCandidate(
                ergsIn,
                ArbPoolContracts.arbPoolBootScript(EmissionLP),
                ctx.network.height,
                tokenAmountLP,
                pairIn,
                registers
            )
            let candidates0 = new OutputCandidates(proxyOut)
            let chain: ErgoTxChainCandidate = notImplemented()
            return chain
        } else {
            return new InsufficientInputs("Token pair not provided")
        }
    }

    deposit(poolId: PoolId, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs {
        return notImplemented()
    }

    redeem(poolId: PoolId, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs {
        return notImplemented()
    }

    swap(poolId: PoolId, params: SwapParams, ctx: TransactionContext): ErgoTxCandidate | InsufficientInputs {
        return notImplemented()
    }
}
