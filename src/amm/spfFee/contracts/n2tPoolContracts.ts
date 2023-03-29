import {ErgoTree, PublicKey, TokenId} from "@ergolabs/ergo-sdk"
import {SpecExFeePerToken} from "../../../types"
import {Bool, Bytes, Int, Long, ProveDlog, RedeemerBytes} from "../../../utils/contract"
import {decimalToFractional} from "../../../utils/math"
import {PoolId} from "../../common/types"
import {DepositContract, RedeemContract, SwapBuyContract, SwapSellContract} from "./n2tTemplates"

export function deposit(
  poolId: PoolId,
  pk: PublicKey,
  selfX: bigint,
  selfY: bigint,
  maxMinerFee: bigint
): ErgoTree {
  return DepositContract.build({
    refundProp: ProveDlog(pk),
    selfXAmount: Long(selfX),
    selfYAmount: Long(selfY),
    poolNFT: Bytes(poolId),
    redeemerPropBytes: RedeemerBytes(pk),
    maxMinerFee: Long(maxMinerFee)
  })
}

export function redeem(poolId: PoolId, pk: PublicKey, maxMinerFee: bigint): ErgoTree {
  return RedeemContract.build({
    poolNFT: Bytes(poolId),
    maxMinerFee: Long(maxMinerFee),
    redeemerPropBytes: RedeemerBytes(pk),
    refundProp: ProveDlog(pk)
  })
}

export function swapSell(
  poolId: PoolId,
  baseAmount: bigint,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  specIsQuote: boolean,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount)

  return SwapSellContract.build({
    exFeePerTokenDenom: Long(dexFeePerTokenDenom),
    delta: Long(dexFeePerTokenDenom - dexFeePerTokenNum),
    baseAmount: Long(baseAmount),
    feeNum: Int(poolFeeNum),
    refundProp: ProveDlog(pk),
    spectrumIsQuote: Bool(specIsQuote),
    maxExFee: Long(maxExFee),
    poolNFT: Bytes(poolId),
    redeemerPropBytes: RedeemerBytes(pk),
    quoteId: Bytes(quoteId),
    minQuoteAmount: Long(minQuoteAmount),
    spectrumId: Bytes(exFeePerToken.tokenId),
    feeDenom: Int(1000),
    maxMinerFee: Long(maxMinerFee)
  })
}

export function swapBuy(
  poolId: PoolId,
  baseAmount: bigint,
  poolFeeNum: number,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount)

  return SwapBuyContract.build({
    baseAmount: Long(baseAmount),
    feeNum: Int(poolFeeNum),
    refundProp: ProveDlog(pk),
    maxExFee: Long(maxExFee),
    exFeePerTokenDenom: Long(dexFeePerTokenDenom),
    exFeePerTokenNum: Long(dexFeePerTokenNum),
    poolNFT: Bytes(poolId),
    redeemerPropBytes: RedeemerBytes(pk),
    minQuoteAmount: Long(minQuoteAmount),
    spectrumId: Bytes(exFeePerToken.tokenId),
    feeDenom: Int(1000),
    maxMinerFee: Long(maxMinerFee)
  })
}
