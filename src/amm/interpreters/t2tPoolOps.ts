import {PoolSetupParams} from "../models/poolSetupParams";
import {SwapParams} from "../models/swapParams";
import {T2tPoolContracts as scripts} from "../contracts/t2tPoolContracts";
import {EmissionLP} from "../constants";
import {InsufficientInputs} from "../../wallet/errors/insufficientInputs";
import {TransactionContext} from "../../wallet/models/transactionContext";
import {Blake2b256} from "../../utils/blake2b256";
import {MinBoxAmountNErgs} from "../../wallet/constants";
import {
    ByteaConstant,
    Int64Constant,
    Int32Constant,
    BoxSelection,
    ErgoTx,
    Prover,
    ErgoBoxCandidate
} from "../../wallet";
import {DepositParams} from "../models/depositParams";
import {RedeemParams} from "../models/redeemParams";
import {ergoTreeFromAddress, ergoTreeToBytea} from "../../wallet/entities/ergoTree";
import {PoolOps} from "./poolOps";
import {EmptyRegisters, RegisterId, registers} from "../../wallet/entities/registers";
import {fromHex} from "../../utils/hex";
import {stringToBytea} from "../../utils/utf8";
import {TxRequest} from "../../wallet/entities/txRequest";
import {TxAssembler} from "../../wallet/txAssembler";

export class T2tPoolOps implements PoolOps {

    constructor(
        public readonly prover: Prover,
        public readonly txAssembler: TxAssembler
    ) {}

    async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
        let [x, y] = [params.x.asset, params.y.asset]
        let height = ctx.network.height
        let inputs = ctx.inputs
        let outputGranted = inputs.totalOutputWithoutChange
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === x.id),
            outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === y.id)
        ].flat()
        if (pairIn.length == 2) {
            let [tickerX, tickerY] = [x.name || x.id.slice(0, 8), y.name || y.id.slice(0, 8)]
            let poolBootScript = scripts.poolBoot(EmissionLP)
            let poolSH: Uint8Array = Blake2b256.hash(ergoTreeToBytea(poolBootScript))
            let newTokenLP = {tokenId: inputs.newTokenId, amount: EmissionLP}
            let proxyOut: ErgoBoxCandidate = {
                value: outputGranted.nErgs - ctx.feeNErgs,
                ergoTree: scripts.poolBoot(EmissionLP),
                creationHeight: height,
                assets: [newTokenLP, ...pairIn],
                additionalRegisters: registers([
                    [RegisterId.R4, new ByteaConstant(stringToBytea(`${tickerX}_${tickerY}_LP`))],
                    [RegisterId.R5, new ByteaConstant(poolSH)],
                    [RegisterId.R6, new Int64Constant(params.outputShare)],
                    [RegisterId.R7, new Int32Constant(params.feeNumerator)],
                    [RegisterId.R8, new Int64Constant(ctx.feeNErgs)],
                    [RegisterId.R9, new ByteaConstant(fromHex(params.initiatorPk))]])
            }
            let txr0: TxRequest = {
                inputs: inputs,
                dataInputs: [],
                outputs: [proxyOut],
                changeAddress: ctx.changeAddress,
                feeNErgs: ctx.feeNErgs
            }
            let tx0 = await this.prover.sign(this.txAssembler.assemble(txr0))

            let lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
            let lpShares = {tokenId: newTokenLP.tokenId, amount: params.outputShare}
            let lpOut: ErgoBoxCandidate = {
                value: MinBoxAmountNErgs, // todo: calc upon actual feeBerByte.
                ergoTree: lpP2Pk,
                creationHeight: height,
                assets: [lpShares],
                additionalRegisters: EmptyRegisters
            }

            let poolBootBox = tx0.outputs[0]
            let tx1Inputs = BoxSelection.safe(poolBootBox)

            let newTokenNFT = {tokenId: tx1Inputs.newTokenId, amount: 1n}
            let poolAmountLP = newTokenLP.amount - lpShares.amount
            let poolLP = {tokenId: newTokenLP.tokenId, amount: poolAmountLP}
            let poolOut: ErgoBoxCandidate = {
                value: poolBootBox.value - lpOut.value - ctx.feeNErgs,
                ergoTree: scripts.pool(EmissionLP),
                creationHeight: height,
                assets: [newTokenNFT, poolLP, ...poolBootBox.assets.slice(1)],
                additionalRegisters: registers([[RegisterId.R4, new Int32Constant(params.feeNumerator)]])
            }
            let txr1: TxRequest = {
                inputs: tx1Inputs,
                dataInputs: [],
                outputs: [poolOut, lpOut],
                changeAddress: ctx.changeAddress,
                feeNErgs: ctx.feeNErgs
            }
            let tx1 = await this.prover.sign(this.txAssembler.assemble(txr1))

            return Promise.resolve([tx0, tx1])
        } else {
            return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
        }
    }

    deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
        let [x, y] = [params.x, params.y]
        let proxyScript = scripts.deposit(EmissionLP, params.poolId, params.pk, params.dexFee)
        let outputGranted = ctx.inputs.totalOutputWithoutChange
        let pairIn = [
            outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === x.id),
            outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === y.id)
        ].flat()
        if (pairIn.length == 2) {
            let out: ErgoBoxCandidate = {
                value: outputGranted.nErgs,
                ergoTree: proxyScript,
                creationHeight: ctx.network.height,
                assets: pairIn,
                additionalRegisters: EmptyRegisters
            }
            let txr = {
                inputs: ctx.inputs,
                dataInputs: [],
                outputs: [out],
                changeAddress: ctx.changeAddress,
                feeNErgs: ctx.feeNErgs
            }
            return this.prover.sign(this.txAssembler.assemble(txr))
        } else {
            return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
        }
    }

    redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
        let proxyScript = scripts.redeem(EmissionLP, params.poolId, params.pk, params.dexFee)
        let outputGranted = ctx.inputs.totalOutputWithoutChange
        let tokensIn = outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === params.lp.id)
        if (tokensIn.length == 1) {
            let out = {
                value: outputGranted.nErgs,
                ergoTree: proxyScript,
                creationHeight: ctx.network.height,
                assets: tokensIn,
                additionalRegisters: EmptyRegisters
            }
            let txr = {
                inputs: ctx.inputs,
                dataInputs: [],
                outputs: [out],
                changeAddress: ctx.changeAddress,
                feeNErgs: ctx.feeNErgs
            }
            return this.prover.sign(this.txAssembler.assemble(txr))
        } else {
            return Promise.reject(new InsufficientInputs(`LP tokens not provided`))
        }
    }

    swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
        let proxyScript = scripts.swap(
            params.poolScriptHash,
            params.poolFeeNum,
            params.quoteAsset,
            params.minQuoteOutput,
            params.dexFeePerToken,
            params.pk
        )
        let outputGranted = ctx.inputs.totalOutputWithoutChange
        let baseAssetId = params.baseInput.asset.id
        let tokensIn = outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === baseAssetId)
        if (tokensIn.length == 1) {
            let out: ErgoBoxCandidate = {
                value: outputGranted.nErgs,
                ergoTree: proxyScript,
                creationHeight: ctx.network.height,
                assets: tokensIn,
                additionalRegisters: EmptyRegisters
            }
            let txr: TxRequest = {
                inputs: ctx.inputs,
                dataInputs: [],
                outputs: [out],
                changeAddress: ctx.changeAddress,
                feeNErgs: ctx.feeNErgs
            }
            return this.prover.sign(this.txAssembler.assemble(txr))
        } else {
            return Promise.reject(new InsufficientInputs(`Base asset '${baseAssetId}' not provided`))
        }
    }
}