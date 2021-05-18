import {PoolSetupParams} from "../models/poolSetupParams";
import {SwapParams} from "../models/swapParams";
import {T2tPoolContracts} from "../contracts/t2tPoolContracts";
import {EmissionLP} from "../constants";
import {InsufficientInputs} from "../../wallet/errors/insufficientInputs";
import {TransactionContext} from "../../wallet/models/transactionContext";
import {ErgoBoxCandidate} from "../../wallet/entities/ergoBoxCandidate";
import {ErgoTxCandidate} from "../../wallet/entities/ergoTxCandidate";
import {Prover} from "../../wallet/prover";
import {ErgoTx} from "../../wallet/entities/ergoTx";
import {Blake2b256} from "../../utils/blake2b256";
import {MinBoxAmountNErgs} from "../../wallet/constants";
import {Token} from "../../wallet/entities/token";
import {BoxSelection} from "../../wallet/entities/boxSelection";
import {ByteaConstant, Int64Constant, Int32Constant} from "../../wallet/entities/constant";
import {mintLP, mintPoolNFT} from "../utils/tokens"
import {DepositParams} from "../models/depositParams";
import {RedeemParams} from "../models/redeemParams";
import {ergoTreeFromAddress, ergoTreeToBytea} from "../../wallet/entities/ergoTree";
import {PoolOpsInterpreter} from "./poolOpsInterpreter";

export class T2tPoolOpsInterpreterImpl implements PoolOpsInterpreter {

    readonly prover: Prover

    constructor(prover: Prover) {
        this.prover = prover
    }

    async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
        let [x, y] = [params.x.asset, params.y.asset]
        let height = ctx.network.height
        let inputs = ctx.inputs
        let outputGranted = inputs.totalOutputWithoutChange()
        let ergsIn = outputGranted.nErgs - ctx.feeNErgs
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.id === x.id),
            outputGranted.tokens.filter((t, _i, _xs) => t.id === y.id)
        ].flat()
        if (pairIn.length == 2) {
            let tokenIdLP = inputs.boxes[0].id
            let newTokenLP = mintLP(tokenIdLP, x.name, y.name)
            let poolBootScript = T2tPoolContracts.poolBoot(EmissionLP)
            let poolSH: Uint8Array = Blake2b256.hash(ergoTreeToBytea(poolBootScript))
            let registers = [
                {id: 4, value: new ByteaConstant(poolSH)},
                {id: 5, value: new Int64Constant(params.outputShare)},
                {id: 6, value: new Int32Constant(params.feeNumerator)},
                {id: 7, value: new Int64Constant(ctx.feeNErgs)}]
            let proxyOut = new ErgoBoxCandidate(
                ergsIn,
                T2tPoolContracts.poolBoot(EmissionLP),
                ctx.network.height,
                pairIn,
                registers,
                newTokenLP
            )
            let txc0 = ErgoTxCandidate.make(ctx.inputs, [proxyOut], height, ctx.feeNErgs, ctx.changeAddress)
            let tx0 = await this.prover.sign(txc0)

            let lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
            let lpShares = new Token(tokenIdLP, params.outputShare)
            let lpOut = new ErgoBoxCandidate(MinBoxAmountNErgs, lpP2Pk, height, [lpShares])

            let poolBootBox = tx0.outputs[0]
            let poolValueNErgs = poolBootBox.value - lpOut.value - ctx.feeNErgs
            let poolScript = T2tPoolContracts.pool(EmissionLP)

            let newTokenNFT = mintPoolNFT(tokenIdLP, x.name, y.name)
            let poolAmountLP = newTokenLP.amount - lpShares.amount
            let poolLP = new Token(tokenIdLP, poolAmountLP)
            let poolTokens = [poolLP].concat(poolBootBox.tokens.slice(1))
            let poolRegisters = [{id: 4, value: new Int32Constant(params.feeNumerator)}]
            let poolOut = new ErgoBoxCandidate(poolValueNErgs, poolScript, height, poolTokens, poolRegisters, newTokenNFT)
            let txc1Inputs = BoxSelection.safe(poolBootBox)
            let txc1 = ErgoTxCandidate.make(txc1Inputs, [poolOut, lpOut], height, ctx.feeNErgs, ctx.changeAddress)
            let tx1 = await this.prover.sign(txc1)

            return Promise.resolve([tx0, tx1])
        } else {
            return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
        }
    }

    deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
        let [x, y] = [params.x, params.y]
        let proxyScript = T2tPoolContracts.deposit(EmissionLP, params.poolId, params.pk, params.dexFee)
        let outputGranted = ctx.inputs.totalOutputWithoutChange()
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.id === x.id),
            outputGranted.tokens.filter((t, _i, _xs) => t.id === y.id)
        ].flat()
        if (pairIn.length == 2) {
            let out = new ErgoBoxCandidate(outputGranted.nErgs, proxyScript, ctx.network.height, pairIn)
            let txc = ErgoTxCandidate.make(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.prover.sign(txc)
        } else {
            return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
        }
    }

    redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
        let proxyScript = T2tPoolContracts.redeem(EmissionLP, params.poolId, params.pk, params.dexFee)
        let outputGranted = ctx.inputs.totalOutputWithoutChange()
        let tokensIn = outputGranted.tokens.filter((t, _i, _xs) => t.id === params.lp.id)
        if (tokensIn.length == 1) {
            let out = new ErgoBoxCandidate(outputGranted.nErgs, proxyScript, ctx.network.height, tokensIn)
            let txc = ErgoTxCandidate.make(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.prover.sign(txc)
        } else {
            return Promise.reject(new InsufficientInputs(`LP tokens not provided`))
        }
    }

    swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
        let proxyScript = T2tPoolContracts.swap(
            params.poolScriptHash,
            params.poolFeeNum,
            params.quoteAsset,
            params.minQuoteOutput,
            params.dexFeePerToken,
            params.pk
        )
        let outputGranted = ctx.inputs.totalOutputWithoutChange()
        let baseAssetId = params.baseInput.asset.id
        let tokensIn = outputGranted.tokens.filter((t, _i, _xs) => t.id === baseAssetId)
        if (tokensIn.length == 1) {
            let out = new ErgoBoxCandidate(outputGranted.nErgs, proxyScript, ctx.network.height, tokensIn)
            let txc = ErgoTxCandidate.make(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.prover.sign(txc)
        } else {
            return Promise.reject(new InsufficientInputs(`Base asset '${baseAssetId}' not provided`))
        }
    }
}