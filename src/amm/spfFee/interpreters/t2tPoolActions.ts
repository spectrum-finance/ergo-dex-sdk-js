import {
  Address,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  InsufficientInputs,
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
import * as T2T from "../contracts/t2tPoolContracts"

export class T2tPoolActions implements PoolActions<TxRequest, SpecExFeeType> {
  constructor(public readonly uiRewardAddress: Address, private readonly setupImpl: PoolSetupAction) {}

  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<TxRequest[]> {
    return this.setupImpl.setup(params, ctx, this.mkUiReward(ctx.network.height, params.uiFee));
  }

  deposit(params: DepositParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const [x, y] = [params.x, params.y]
    const [specIsX, specIsY] = [params.x.asset.id === SpecAssetId, params.y.asset.id === SpecAssetId]
    const specIsDeposited = specIsX || specIsY

    // TODO: ASK about fee
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const pairIn = [
      outputGranted.assets.filter(t => t.tokenId === x.asset.id),
      outputGranted.assets.filter(t => t.tokenId === y.asset.id),
      specIsDeposited ? [] : outputGranted.assets.filter(t => t.tokenId === SpecAssetId)
    ].flat()

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, 0n)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!((pairIn.length == 2 && specIsDeposited) || pairIn.length === 3))
      return Promise.reject(
        new InsufficientInputs(
          `Wrong number of input tokens provided ${pairIn.length}, required ${specIsDeposited ? 2 : 3}`
        )
      )

    const proxyScript = T2T.deposit(
      params.poolId,
      params.pk,
      params.exFee,
      ctx.feeNErgs,
      pairIn[0].amount,
      pairIn[1].amount
    )

    const orderOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
      assets: pairIn,
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
    const proxyScript = T2T.redeem(params.poolId, params.pk, params.exFee, ctx.feeNErgs)
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const tokensIn = outputGranted.assets
      .filter(t => t.tokenId === params.lp.asset.id)
      .concat(outputGranted.assets.filter(t => t.tokenId === SpecAssetId))

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, 0n)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (tokensIn.length != 2)
      return Promise.reject(
        new InsufficientInputs(`Wrong number of input tokens provided ${tokensIn.length}, required 2`)
      )

    const orderOut = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
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

  swap(params: SwapParams<SpecExFeeType>, ctx: TransactionContext): Promise<TxRequest> {
    const specIsBase = params.baseInput.asset.id === SpecAssetId
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const baseAssetId = params.baseInput.asset.id

    const tokensIn = outputGranted.assets
      .filter(t => t.tokenId === baseAssetId)
      .concat(specIsBase ? [] : outputGranted.assets.filter(t => t.tokenId === SpecAssetId))

    const minNErgs = minValueForOrder(ctx.feeNErgs, params.uiFee, 0n)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (!((tokensIn.length === 1 && specIsBase) || tokensIn.length === 2))
      return Promise.reject(
        new InsufficientInputs(
          `Base asset ${params.baseInput.asset.name} not provided or SPF fee not provided`
        )
      )

    const maxExFee = specIsBase ? tokensIn[0].amount - params.baseInput.amount : tokensIn[1].amount
    const proxyScript = T2T.swap(
      params.poolId,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.exFeePerToken,
      ctx.feeNErgs,
      maxExFee,
      params.baseInput.amount,
      params.quoteAsset === SpecAssetId,
      params.pk
    )

    const orderOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: proxyScript,
      creationHeight: ctx.network.height,
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
