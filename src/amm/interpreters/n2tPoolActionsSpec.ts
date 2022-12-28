import {
  Address,
  BoxSelection,
  ByteaConstant,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  extractOutputsFromTxRequest,
  Int32Constant,
  isNative,
  MinBoxValue,
  RegisterId,
  registers,
  TransactionContext,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {InsufficientInputs} from "@ergolabs/ergo-sdk"
import {prepend} from "ramda"
import {NativeExFeeType, SpecExFeeType} from "../../types"
import {stringToBytea} from "../../utils/utf8"
import {BurnLP, EmissionLP} from "../constants"
import * as N2T from "../contracts/n2tPoolContracts"
import {DepositParams} from "../models/depositParams"
import {PoolSetupParams} from "../models/poolSetupParams"
import {RedeemParams} from "../models/redeemParams"
import {SwapParams} from "../models/swapParams"
import {minValueForOrder, minValueForSetup} from "./mins"
import {PoolActions} from "./poolActions"

export class N2tPoolActionsNative implements PoolActions<TxRequest, SpecExFeeType> {
  constructor(public readonly uiRewardAddress: Address) {}

  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<TxRequest[]> {
    const [x, y] = [params.x.asset, params.y.asset]
    const height = ctx.network.height
    const inputs = ctx.inputs
    const outputGranted = inputs.totalOutputWithoutChange
    const inY = outputGranted.assets.filter(t => t.tokenId === y.id)[0]

    const minNErgs = minValueForSetup(ctx.feeNErgs, params.uiFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!inY) return Promise.reject(new InsufficientInputs(`Token ${y.name} not provided`))

    const [tickerX, tickerY] = [x.name || x.id.slice(0, 8), y.name || y.id.slice(0, 8)]
    const newTokenLP = {tokenId: inputs.newTokenId, amount: EmissionLP - BurnLP}
    const bootOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: ergoTreeFromAddress(ctx.selfAddress),
      creationHeight: height,
      assets: [newTokenLP, inY],
      additionalRegisters: registers([
        [RegisterId.R4, new ByteaConstant(stringToBytea(`${tickerX}_${tickerY}_LP`))]
      ])
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, params.uiFee)
    const txr0: TxRequest = {
      inputs: inputs,
      dataInputs: [],
      outputs: prepend(bootOut, uiRewardOut),
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }

    const lpP2Pk = ergoTreeFromAddress(ctx.changeAddress)
    const lpShares = {tokenId: newTokenLP.tokenId, amount: params.outputShare}
    const lpOut: ErgoBoxCandidate = {
      value: MinBoxValue,
      ergoTree: lpP2Pk,
      creationHeight: height,
      assets: [lpShares],
      additionalRegisters: EmptyRegisters
    }

    const poolBootBox = extractOutputsFromTxRequest(txr0, ctx.network)[0]
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
    return Promise.resolve([txr0, txr1])
  }

  deposit(params: DepositParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const [x, y] = [params.x, params.y]
    const proxyScript = N2T.depositSpec(params.poolId, params.pk, x.amount, params.exFee, ctx.feeNErgs)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const inY = outputGranted.assets.filter(t => t.tokenId === y.asset.id)[0]

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, params.exFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!inY) return Promise.reject(new InsufficientInputs(`Token ${y.asset.name} not provided`))

    const height = ctx.network.height
    const orderOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: height,
      assets: [inY],
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, params.uiFee)
    return Promise.resolve({
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: prepend(orderOut, uiRewardOut),
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    })
  }

  redeem(params: RedeemParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const proxyScript = N2T.redeemSpec(params.poolId, params.pk, params.exFee, ctx.feeNErgs)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const tokensIn = outputGranted.assets.filter(t => t.tokenId === params.lp.asset.id)

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, params.exFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (tokensIn.length != 1)
      return Promise.reject(new InsufficientInputs(`Token ${params.lp.asset.name ?? "LP"} not provided`))

    const height = ctx.network.height
    const orderOut = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: height,
      assets: tokensIn,
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, params.uiFee)
    return Promise.resolve({
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: prepend(orderOut, uiRewardOut),
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    })
  }

  async swap(params: SwapParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const out = await (isNative(params.baseInput.asset)
      ? N2tPoolActionsNative.mkSwapSell(params, ctx)
      : N2tPoolActionsNative.mkSwapBuy(params, ctx))
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, params.uiFee)
    return {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: prepend(out, uiRewardOut),
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
  }

  private static async mkSwapSell(
    params: SwapParams<SpecExFeeType>,
    ctx: TransactionContext
  ): Promise<ErgoBoxCandidate> {
    const proxyScript = N2T.swapSellSpec(
      params.poolId,
      params.baseInput.amount,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.exFeePerToken,
      ctx.feeNErgs,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange

    const minExFee = BigInt((Number(params.minQuoteOutput) * params.exFeePerToken).toFixed(0))
    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, minExFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )

    return {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [],
      additionalRegisters: EmptyRegisters
    }
  }

  private static async mkSwapBuy(
    params: SwapParams<SpecExFeeType>,
    ctx: TransactionContext
  ): Promise<ErgoBoxCandidate> {
    const proxyScript = N2T.swapBuySpec(
      params.poolId,
      params.poolFeeNum,
      params.minQuoteOutput,
      params.exFeePerToken,
      ctx.feeNErgs,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const baseAssetId = params.baseInput.asset.id
    const baseIn = outputGranted.assets.filter(t => t.tokenId === baseAssetId)[0]

    const minExFee = BigInt((Number(params.minQuoteOutput) * params.exFeePerToken).toFixed(0))
    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, minExFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!baseIn)
      return Promise.reject(new InsufficientInputs(`Base asset ${params.baseInput.asset.name} not provided`))

    return {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [baseIn],
      additionalRegisters: EmptyRegisters
    }
  }

  private mkUiReward(height: number, uiFee: bigint): ErgoBoxCandidate[] {
    return uiFee > 0
      ? [
          {
            value: uiFee,
            ergoTree: ergoTreeFromAddress(this.uiRewardAddress),
            creationHeight: height,
            assets: [],
            additionalRegisters: EmptyRegisters
          }
        ]
      : []
  }
}
