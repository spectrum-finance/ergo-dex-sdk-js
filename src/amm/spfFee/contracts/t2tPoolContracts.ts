import {ErgoTree, PublicKey, TokenId} from "@ergolabs/ergo-sdk"
import {SpecExFeePerToken} from "../../../types"
import {Bool, Bytes, Int, Long, ProveDlog, RedeemerBytes} from "../../../utils/contract"
import {decimalToFractional} from "../../../utils/math"
import {PoolId} from "../../common/types"
import {DepositContract, RedeemContract, SwapContract} from "./t2tTemplates"

export function deposit(
  poolId: PoolId,
  pk: PublicKey,
  maxMinerFee: bigint,
  selfXAmount: bigint,
  selfYAmount: bigint
): ErgoTree {
  return DepositContract
    .build({
      selfXAmount:       Long(selfXAmount),
      refundProp:        ProveDlog(pk),
      selfYAmount:       Long(selfYAmount),
      poolNFT:           Bytes(poolId),
      redeemerPropBytes: RedeemerBytes(pk),
      maxMinerFee:       Long(maxMinerFee)
    })
}

export function redeem(
  poolId: PoolId,
  pk: PublicKey,
  maxMinerFee: bigint
): ErgoTree {
  return RedeemContract
    .build({
      refundProp:        ProveDlog(pk),
      poolNFT:           Bytes(poolId),
      redeemerPropBytes: RedeemerBytes(pk),
      maxMinerFee:       Long(maxMinerFee)
    })
}

export function swap(
  poolId: PoolId,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  baseAmount: bigint,
  specIsQuote: boolean,
  pk: PublicKey
): ErgoTree {
  const [exFeePerTokenNum, exFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount)

  return SwapContract
    .build({
      quoteId:            Bytes(quoteId),
      maxExFee:           Long(maxExFee),
      exFeePerTokenDenom: Long(exFeePerTokenDenom),
      baseAmount:         Long(baseAmount),
      feeNum:             Int(poolFeeNum),
      feeDenom:           Int(1000),
      refundProp:         ProveDlog(pk),
      spectrumIsQuote:    Bool(specIsQuote),
      poolNFT:            Bytes(poolId),
      redeemerPropBytes:  RedeemerBytes(pk),
      minQuoteAmount:     Long(minQuoteAmount),
      delta:              Long(exFeePerTokenDenom - exFeePerTokenNum),
      spectrumId:         Bytes(exFeePerToken.tokenId),
      maxMinerFee:        Long(maxMinerFee)
    })
}
