import {PoolSetupParams} from "../models/poolSetupParams"
import {SwapParams} from "../models/swapParams"
import {T2tPoolContracts as scripts} from "../contracts/t2tPoolContracts"
import {EmissionLP} from "../constants"
import {InsufficientInputs} from "../../ergo/errors/insufficientInputs"
import {MinBoxAmountNErgs} from "../../ergo/constants"
import {
  ByteaConstant,
  Int32Constant,
  BoxSelection,
  ErgoTx,
  Prover,
  ErgoBoxCandidate,
  TransactionContext
} from "../../ergo"
import {DepositParams} from "../models/depositParams"
import {RedeemParams} from "../models/redeemParams"
import {ergoTreeFromAddress} from "../../ergo/entities/ergoTree"
import {PoolOps} from "./poolOps"
import {EmptyRegisters, RegisterId, registers} from "../../ergo/entities/registers"
import {stringToBytea} from "../../utils/utf8"
import {TxRequest} from "../../ergo/wallet/entities/txRequest"
import {TxAssembler} from "../../ergo"

export class T2tPoolOps implements PoolOps {
  constructor(public readonly prover: Prover, public readonly txAsm: TxAssembler) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
    let [x, y] = [params.x.asset, params.y.asset]
    let height = ctx.network.height
    let inputs = ctx.inputs
    let outputGranted = inputs.totalOutputWithoutChange
    let pairIn = [
      outputGranted.assets.filter((t, _i, _xs) => t.tokenId === x.id),
      outputGranted.assets.filter((t, _i, _xs) => t.tokenId === y.id)
    ].flat()
    let minNErgs = ctx.feeNErgs * 2n + params.lockNanoErgs + MinBoxAmountNErgs

    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
    if (pairIn.length !== 2)
      return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
    else {
      let [tickerX, tickerY] = [x.name || x.id.slice(0, 8), y.name || y.id.slice(0, 8)]
      let newTokenLP = {tokenId: inputs.newTokenId, amount: Number(EmissionLP)}
      let bootOut: ErgoBoxCandidate = {
        value: outputGranted.nErgs - Number(ctx.feeNErgs),
        ergoTree: ergoTreeFromAddress(ctx.selfAddress),
        creationHeight: height,
        assets: [newTokenLP, ...pairIn],
        additionalRegisters: registers([
          [RegisterId.R4, new ByteaConstant(stringToBytea(`${tickerX}_${tickerY}_LP`))]
        ])
      }
      let txr0: TxRequest = {
        inputs: inputs,
        dataInputs: [],
        outputs: [bootOut],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs
      }
      let tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))

      let lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
      let lpShares = {tokenId: newTokenLP.tokenId, amount: Number(params.outputShare)}
      let lpOut: ErgoBoxCandidate = {
        value: Number(MinBoxAmountNErgs), // todo: calc against actual feeBerByte.
        ergoTree: lpP2Pk,
        creationHeight: height,
        assets: [lpShares],
        additionalRegisters: EmptyRegisters
      }

      let poolBootBox = tx0.outputs[0]
      let tx1Inputs = BoxSelection.safe(poolBootBox)

      let newTokenNFT = {tokenId: tx1Inputs.newTokenId, amount: 1}
      let poolAmountLP = newTokenLP.amount - lpShares.amount
      let poolLP = {tokenId: newTokenLP.tokenId, amount: poolAmountLP}
      let poolOut: ErgoBoxCandidate = {
        value: poolBootBox.value - lpOut.value - Number(ctx.feeNErgs),
        ergoTree: scripts.pool(),
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
      let tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))

      return Promise.resolve([tx0, tx1])
    }
  }

  deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
    let [x, y] = [params.x, params.y]
    let proxyScript = scripts.deposit(params.poolId, params.pk, params.dexFee)
    let outputGranted = ctx.inputs.totalOutputWithoutChange
    let pairIn = [
      outputGranted.assets.filter((t, _i, _xs) => t.tokenId === x.id),
      outputGranted.assets.filter((t, _i, _xs) => t.tokenId === y.id)
    ].flat()
    if (pairIn.length == 2) {
      let out: ErgoBoxCandidate = {
        value: outputGranted.nErgs - Number(ctx.feeNErgs),
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
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))
    }
  }

  redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
    let proxyScript = scripts.redeem(params.poolId, params.pk, params.dexFee)
    let outputGranted = ctx.inputs.totalOutputWithoutChange
    let tokensIn = outputGranted.assets.filter((t, _i, _xs) => t.tokenId === params.lp.id)
    if (tokensIn.length == 1) {
      let out = {
        value: outputGranted.nErgs - Number(ctx.feeNErgs),
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
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(new InsufficientInputs(`LP tokens not provided`))
    }
  }

  swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
    let proxyScript = scripts.swap(
      params.poolId,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.dexFeePerToken,
      params.pk
    )
    let outputGranted = ctx.inputs.totalOutputWithoutChange
    let baseAssetId = params.baseInput.asset.id
    let tokensIn = outputGranted.assets.filter((t, _i, _xs) => t.tokenId === baseAssetId)
    if (tokensIn.length == 1) {
      let out: ErgoBoxCandidate = {
        value: outputGranted.nErgs - Number(ctx.feeNErgs),
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
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(new InsufficientInputs(`Base asset '${baseAssetId}' not provided`))
    }
  }
}
