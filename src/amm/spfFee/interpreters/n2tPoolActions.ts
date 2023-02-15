import {
  Address,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  InsufficientInputs,
  isNative,
  TransactionContext,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {prepend} from "ramda"
import {SpecAssetId} from "../../../constants"
import {SpecExFeeType} from "../../../types"
import {minValueForOrder} from "../../common/interpreters/mins"
import {PoolActions} from "../../common/interpreters/poolActions"
import {PoolSetupAction} from "../../common/interpreters/poolSetupAction"
import {DepositParams} from "../../common/models/depositParams"
import {PoolSetupParams} from "../../common/models/poolSetupParams"
import {RedeemParams} from "../../common/models/redeemParams"
import {SwapParams} from "../../common/models/swapParams"
import * as N2T from "../contracts/n2tPoolContracts"

export class N2tPoolActions implements PoolActions<TxRequest, SpecExFeeType> {
  constructor(public readonly uiRewardAddress: Address, private readonly setupImpl: PoolSetupAction) {}

  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<TxRequest[]> {
    return this.setupImpl.setup(params, ctx, this.mkUiReward(ctx.network.height, params.uiFee));
  }

  deposit(params: DepositParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const [x, y] = [params.x, params.y]
    const proxyScript = N2T.deposit(
      params.poolId,
      params.pk,
      x.amount,
      params.exFee,
      ctx.feeNErgs,
      y.asset.id === SpecAssetId
    );
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const inY = outputGranted.assets.filter(t => t.tokenId === y.asset.id)[0]

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, params.exFee.amount)
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
    const proxyScript = N2T.redeem(params.poolId, params.pk, params.exFee, ctx.feeNErgs)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const tokensIn = outputGranted.assets.filter(t => t.tokenId === params.lp.asset.id)

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, params.exFee.amount)
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
      ? N2tPoolActions.mkSwapSell(params, ctx)
      : N2tPoolActions.mkSwapBuy(params, ctx))
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
    const proxyScript = N2T.swapSell(
      params.poolId,
      params.baseInput.amount,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.exFeePerToken,
      ctx.feeNErgs,
      params.maxExFee.amount,
      params.quoteAsset === SpecAssetId,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const exFeeIn = outputGranted.assets.filter(t => t.tokenId === SpecAssetId)[0];

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, 0n)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )

    return {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: [exFeeIn],
      additionalRegisters: EmptyRegisters
    }
  }

  private static async mkSwapBuy(
    params: SwapParams<SpecExFeeType>,
    ctx: TransactionContext
  ): Promise<ErgoBoxCandidate> {
    const proxyScript = N2T.swapBuy(
      params.poolId,
      params.baseInput.amount,
      params.poolFeeNum,
      params.minQuoteOutput,
      params.exFeePerToken,
      ctx.feeNErgs,
      params.maxExFee.amount,
      params.pk
    )
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const baseAssetId = params.baseInput.asset.id
    const baseIn = outputGranted.assets.filter(t => t.tokenId === baseAssetId)[0]
    const exFeeIn = outputGranted.assets.filter(t => t.tokenId === SpecAssetId)[0]

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, 0n)
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
      assets: baseAssetId === SpecAssetId ? [baseIn] : [baseIn, exFeeIn],
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
