import {
  BoxSelection,
  ByteaConstant, EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  ErgoTx, Int32Constant, isNative,
  MinBoxValue,
  Prover, RegisterId, registers,
  TransactionContext,
  TxAssembler, TxRequest
} from "@ergolabs/ergo-sdk"
import {InsufficientInputs} from "@ergolabs/ergo-sdk/build/main/errors/insufficientInputs"
import {PoolSetupParams} from "../models/poolSetupParams"
import {SwapParams} from "../models/swapParams"
import * as N2T from "../contracts/n2tPoolContracts"
import {BurnLP, EmissionLP, MinPoolBoxValue} from "../constants"
import {DepositParams} from "../models/depositParams"
import {RedeemParams} from "../models/redeemParams"
import {PoolActions} from "./poolActions"
import {stringToBytea} from "../../utils/utf8"

export class N2tPoolActions implements PoolActions {
  constructor(public readonly prover: Prover, public readonly txAsm: TxAssembler) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
    const [x, y] = [params.x.asset, params.y.asset]
    const height = ctx.network.height
    const inputs = ctx.inputs
    const outputGranted = inputs.totalOutputWithoutChange
    const inY = outputGranted.assets.filter(t => t.tokenId === y.id)[0]

    const minNErgs = ctx.feeNErgs * 2n + MinPoolBoxValue + MinBoxValue
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!inY) return Promise.reject(new InsufficientInputs(`Token ${y.name} not provided`))

    const [tickerX, tickerY] = [x.name || x.id.slice(0, 8), y.name || y.id.slice(0, 8)]
    const newTokenLP = {tokenId: inputs.newTokenId, amount: EmissionLP - BurnLP}
    const bootOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: ergoTreeFromAddress(ctx.selfAddress),
      creationHeight: height,
      assets: [newTokenLP, inY],
      additionalRegisters: registers([
        [RegisterId.R4, new ByteaConstant(stringToBytea(`${tickerX}_${tickerY}_LP`))]
      ])
    }
    const txr0: TxRequest = {
      inputs: inputs,
      dataInputs: [],
      outputs: [bootOut],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    const tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))

    const lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
    const lpShares = {tokenId: newTokenLP.tokenId, amount: params.outputShare}
    const lpOut: ErgoBoxCandidate = {
      value: MinBoxValue,
      ergoTree: lpP2Pk,
      creationHeight: height,
      assets: [lpShares],
      additionalRegisters: EmptyRegisters
    }

    const poolBootBox = tx0.outputs[0]
    const tx1Inputs = BoxSelection.safe(poolBootBox)

    const newTokenNFT = {tokenId: tx1Inputs.newTokenId, amount: 1n}
    const poolAmountLP = newTokenLP.amount - lpShares.amount
    const poolLP = {tokenId: newTokenLP.tokenId, amount: poolAmountLP}
    const poolOut: ErgoBoxCandidate = {
      value: poolBootBox.value - lpOut.value - ctx.feeNErgs,
      ergoTree: N2T.pool(),
      creationHeight: height,
      assets: [newTokenNFT, poolLP, ...poolBootBox.assets.slice(1)],
      additionalRegisters: registers([[RegisterId.R4, new Int32Constant(params.feeNumerator)]])
    }
    const txr1: TxRequest = {
      inputs: tx1Inputs,
      dataInputs: [],
      outputs: [poolOut, lpOut],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    const tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))

    return Promise.resolve([tx0, tx1])
  }

  deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
    const [x, y] = [params.x, params.y]
    const proxyScript = N2T.deposit(params.poolId, params.pk, x.amount, params.dexFee)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const inY = outputGranted.assets.filter(t => t.tokenId === y.asset.id)[0]

    const minNErgs = ctx.feeNErgs * 2n + MinBoxValue * 2n
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!inY) return Promise.reject(new InsufficientInputs(`Token ${y.asset.name} not provided`))

    const out: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [inY],
      additionalRegisters: EmptyRegisters
    }
    const txr = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [out],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
  }

  redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
    const proxyScript = N2T.redeem(params.poolId, params.pk, params.dexFee)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const tokensIn = outputGranted.assets.filter(t => t.tokenId === params.lp.asset.id)

    const minNErgs = ctx.feeNErgs * 2n + MinBoxValue * 2n
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (tokensIn.length != 1)
      return Promise.reject(new InsufficientInputs(`Token ${params.lp.asset.name ?? "LP"} not provided`))

    const out = {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: tokensIn,
      additionalRegisters: EmptyRegisters
    }
    const txr = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [out],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
  }

  async swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
    const out = await (isNative(params.baseInput.asset)
      ? this.mkSwapSell(params, ctx)
      : this.mkSwapBuy(params, ctx))
    const txr: TxRequest = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [out],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
  }

  private async mkSwapSell(params: SwapParams, ctx: TransactionContext): Promise<ErgoBoxCandidate> {
    const proxyScript = N2T.swapSell(
      params.poolId,
      params.baseInput.amount,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.dexFeePerToken,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange

    const minNErgs = ctx.feeNErgs * 2n + MinBoxValue * 2n
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )

    return {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [],
      additionalRegisters: EmptyRegisters
    }
  }

  private async mkSwapBuy(params: SwapParams, ctx: TransactionContext): Promise<ErgoBoxCandidate> {
    const proxyScript = N2T.swapBuy(
      params.poolId,
      params.poolFeeNum,
      params.minQuoteOutput,
      params.dexFeePerToken,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const baseAssetId = params.baseInput.asset.id
    const baseIn = outputGranted.assets.filter(t => t.tokenId === baseAssetId)[0]

    const minNErgs = ctx.feeNErgs * 2n + MinBoxValue * 2n
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!baseIn)
      return Promise.reject(new InsufficientInputs(`Base asset ${params.baseInput.asset.name} not provided`))

    return {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [baseIn],
      additionalRegisters: EmptyRegisters
    }
  }
}
