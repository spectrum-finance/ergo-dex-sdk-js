import {
  Address,
  BoxSelection,
  ByteaConstant,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  extractOutputsFromTxRequest,
  Int32Constant,
  MinBoxValue,
  RegisterId,
  registers,
  TransactionContext,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {InsufficientInputs} from "@ergolabs/ergo-sdk"
import {prepend} from "ramda"
import {SpecAssetId} from "../../constants"
import {SpecExFeeType} from "../../types"
import {stringToBytea} from "../../utils/utf8"
import {BurnLP, EmissionLP} from "../common/constants"
import * as T2T from "../contracts/t2tPoolContracts"
import {DepositParams} from "../common/models/depositParams"
import {PoolSetupParams} from "../common/models/poolSetupParams"
import {RedeemParams} from "../common/models/redeemParams"
import {SwapParams} from "../common/models/swapParams"
import {minValueForOrder, minValueForSetup} from "./mins"
import {PoolActions} from "./poolActions"

export class T2tPoolActionsSpec implements PoolActions<TxRequest, SpecExFeeType> {
  constructor(public readonly uiRewardAddress: Address) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<TxRequest[]> {
    const [x, y] = [params.x.asset, params.y.asset]
    const height = ctx.network.height
    const inputs = ctx.inputs
    const outputGranted = inputs.totalOutputWithoutChange
    const pairIn = [
      outputGranted.assets.filter(t => t.tokenId === x.id),
      outputGranted.assets.filter(t => t.tokenId === y.id)
    ].flat()

    const minNErgs = minValueForSetup(ctx.feeNErgs, params.uiFee)
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    if (pairIn.length !== 2)
      return Promise.reject(new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`))

    const [tickerX, tickerY] = [x.name || x.id.slice(0, 8), y.name || y.id.slice(0, 8)]
    const newTokenLP = {tokenId: inputs.newTokenId, amount: EmissionLP - BurnLP}
    const bootOut: ErgoBoxCandidate = {
      value: outputGranted.nErgs - ctx.feeNErgs - params.uiFee,
      ergoTree: ergoTreeFromAddress(ctx.selfAddress),
      creationHeight: height,
      assets: [newTokenLP, ...pairIn],
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
      ergoTree: T2T.pool(),
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
    const [specIsX, specIsY] = [params.x.asset.id === SpecAssetId, params.y.asset.id === SpecAssetId]
    const specIsDeposited = specIsX || specIsY

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

    const proxyScript = T2T.depositToken(
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
    const proxyScript = T2T.redeemToken(params.poolId, params.pk, params.exFee, ctx.feeNErgs)
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
    const proxyScript = T2T.swapToken(
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
