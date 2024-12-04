import {AssetInfo, ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {NativeExFee, NativeExFeePerToken} from "../../../types"
import {fromHex} from "../../../utils/hex"
import {decimalToFractional} from "../../../utils/math"
import {DexyGOLDAssetId, SigmaPropConstPrefixHex} from "../../common/constants"
import {PoolId} from "../../common/types"
import * as N2Dexy from "./n2dexyTemplates"

export function deposit(
  poolId: PoolId,
  pk: PublicKey,
  selfX: bigint,
  exFee: NativeExFee,
  maxMinerFee: bigint
): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2Dexy.DepositSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(12, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      2,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfX.toString()))
    )
    .with_constant(
      16,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfX.toString()))
    )
    .with_constant(
      15,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(exFee.toString()))
    )
    .with_constant(
      17,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(exFee.toString()))
    )
    .with_constant(
      22,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

// TODO: complete dex actions for dexy
export function redeem(poolId: PoolId, pk: PublicKey, exFee: NativeExFee, maxMinerFee: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2Dexy.RedeemSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(11, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(exFee.toString()))
    )
    .with_constant(
      16,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

export function swapSell(
  poolId: PoolId,
  baseAmount: bigint,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  exFeePerToken: NativeExFeePerToken,
  maxMinerFee: bigint,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken)
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2Dexy.SwapSellSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    .with_constant(14, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(18, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(
      11,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString()))
    )
    .with_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .with_constant(
      2,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(baseAmount.toString()))
    )
    .with_constant(
      17,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(baseAmount.toString()))
    )
    .with_constant(
      22,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

export function swapBuy(
  poolId: PoolId,
  poolFeeNum: number,
  minQuoteAmount: bigint,
  exFeePerToken: NativeExFeePerToken,
  maxMinerFee: bigint,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken)
  const dexFeePerTokenNumDiff = dexFeePerTokenDenom - dexFeePerTokenNum
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2Dexy.SwapBuySample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(11, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(15, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(
      5,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .with_constant(
      6,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenNumDiff.toString())
      )
    )
    .with_constant(
      19,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

export function isDexy(a: AssetInfo): boolean {
  return a.id === DexyGOLDAssetId
}
