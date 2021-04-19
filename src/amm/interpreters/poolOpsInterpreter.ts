import {PoolSetupParams} from "../models/poolSetupParams";
import {SwapParams} from "../models/swapParams";
import {ArbPoolContracts} from "../contracts/arbPoolContracts";
import {EmissionLP} from "../constants";
import {InsufficientInputs} from "../../wallet/errors/insufficientInputs";
import {TransactionContext} from "../../wallet/models/transactionContext";
import {ErgoBoxCandidate} from "../../wallet/entities/ergoBoxCandidate";
import {ErgoTxCandidate} from "../../wallet/entities/ergoTxCandidate";
import {ErgoWallet} from "../../wallet/ergoWallet";
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

export interface PoolOpsInterpreter {

    /** Interpret `setup` operation on a pool to a chain of transactions.
     */
    setup(params: PoolSetupParams, ctx: TransactionContext): ErgoTx[] | InsufficientInputs

    /** Interpret `deposit` operation on a pool to a transaction.
     */
    deposit(params: DepositParams, ctx: TransactionContext): ErgoTx | InsufficientInputs

    /** Interpret `redeem` operation on a pool to a transaction.
     */
    redeem(params: RedeemParams, ctx: TransactionContext): ErgoTx | InsufficientInputs

    /** Interpret `swap` operation on a pool to a transaction.
     */
    swap(params: SwapParams, ctx: TransactionContext): ErgoTx | InsufficientInputs
}

export class PoolOpsInterpreterImpl implements PoolOpsInterpreter {

    readonly wallet: ErgoWallet

    constructor(wallet: ErgoWallet) {
        this.wallet = wallet
    }

    setup(params: PoolSetupParams, ctx: TransactionContext): ErgoTx[] | InsufficientInputs {
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
            let poolBootScript = ArbPoolContracts.arbPoolBootScript(EmissionLP)
            let poolSH: Uint8Array = Blake2b256.hash(ergoTreeToBytea(poolBootScript))
            let registers = [
                {id: 4, value: new ByteaConstant(poolSH)},
                {id: 5, value: new Int64Constant(params.outputShare)},
                {id: 6, value: new Int32Constant(params.feeNumerator)},
                {id: 7, value: new Int64Constant(ctx.feeNErgs)}]
            let proxyOut = new ErgoBoxCandidate(
                ergsIn,
                ArbPoolContracts.arbPoolBootScript(EmissionLP),
                ctx.network.height,
                pairIn,
                registers,
                newTokenLP
            )
            let txc0 = new ErgoTxCandidate(ctx.inputs, [proxyOut], height, ctx.feeNErgs, ctx.changeAddress)
            let tx0 = this.wallet.sign(txc0)

            let lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
            let lpShares = new Token(tokenIdLP, params.outputShare)
            let lpOut = new ErgoBoxCandidate(MinBoxAmountNErgs, lpP2Pk, height, [lpShares])

            let poolBootBox = tx0.outputs[0]
            let poolValueNErgs = poolBootBox.value - lpOut.value - ctx.feeNErgs
            let poolScript = ArbPoolContracts.arbPoolScript(EmissionLP)

            let newTokenNFT = mintPoolNFT(tokenIdLP, x.name, y.name)
            let poolAmountLP = newTokenLP.amount - lpShares.amount
            let poolLP = new Token(tokenIdLP, poolAmountLP)
            let poolTokens = [poolLP].concat(poolBootBox.tokens.slice(1))
            let poolRegisters = [{id: 4, value: new Int32Constant(params.feeNumerator)}]
            let poolOut = new ErgoBoxCandidate(poolValueNErgs, poolScript, height, poolTokens, poolRegisters, newTokenNFT)
            let txc1Inputs = BoxSelection.safe(poolBootBox)
            let txc1 = new ErgoTxCandidate(txc1Inputs, [poolOut, lpOut], height, ctx.feeNErgs, ctx.changeAddress)
            let tx1 = this.wallet.sign(txc1)

            return [tx0, tx1]
        } else {
            return new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`)
        }
    }

    deposit(params: DepositParams, ctx: TransactionContext): ErgoTx | InsufficientInputs {
        let [x, y] = [params.x, params.y]
        let proxyScript = ArbPoolContracts.genericDepositScript(EmissionLP, params.poolId, params.pk)
        let outputGranted = ctx.inputs.totalOutputWithoutChange()
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.id === x.id),
            outputGranted.tokens.filter((t, _i, _xs) => t.id === y.id)
        ].flat()
        if (pairIn.length == 2) {
            let out = new ErgoBoxCandidate(outputGranted.nErgs, proxyScript, ctx.network.height, pairIn)
            let txc = new ErgoTxCandidate(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.wallet.sign(txc)
        } else {
            return new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`)
        }
    }

    redeem(params: RedeemParams, ctx: TransactionContext): ErgoTx | InsufficientInputs {
        let proxyScript = ArbPoolContracts.genericRedeemScript(EmissionLP, params.poolId, params.pk)
        let outputGranted = ctx.inputs.totalOutputWithoutChange()
        let tokensIn = outputGranted.tokens.filter((t, _i, _xs) => t.id === params.lp.id)
        if (tokensIn.length == 1) {
            let out = new ErgoBoxCandidate(outputGranted.nErgs, proxyScript, ctx.network.height, tokensIn)
            let txc = new ErgoTxCandidate(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.wallet.sign(txc)
        } else {
            return new InsufficientInputs(`LP tokens not provided`)
        }
    }

    swap(params: SwapParams, ctx: TransactionContext): ErgoTx | InsufficientInputs {
        let proxyScript = ArbPoolContracts.swapScript(
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
            let txc = new ErgoTxCandidate(ctx.inputs, [out], ctx.network.height, ctx.feeNErgs, ctx.changeAddress)
            return this.wallet.sign(txc)
        } else {
            return new InsufficientInputs(`Base asset '${baseAssetId}' not provided`)
        }
    }
}
