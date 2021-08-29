import * as crypto from "crypto-js"
import {ErgoTree, HexString, PublicKey, TokenId} from "../../ergo"
import {fromHex, toHex} from "../../utils/hex"
import {decimalToFractional} from "../../utils/math"
import {RustModule} from "../../utils/rustLoader"
import {SigmaPropConstPrefixHex} from "../constants"
import {PoolId} from "../types"
import * as N2T from "./n2tTemplates"

export function pool(): ErgoTree {
  return N2T.PoolSample
}

export function poolTemplateHash(): HexString {
  const template = RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.PoolSample).template_bytes()
  return crypto.SHA256(crypto.enc.Hex.parse(toHex(template))).toString(crypto.enc.Hex)
}

export function poolBundle() {
  return {
    poolTree: pool(),
    poolTemplateHash: poolTemplateHash()
  }
}

export function deposit(poolId: PoolId, pk: PublicKey, selfX: bigint, dexFee: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.DepositSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    .with_constant(
      11,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfX.toString()))
    )
    .with_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfX.toString()))
    )
    .to_base16_bytes()
}

export function redeem(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.RedeemSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(11, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    .to_base16_bytes()
}

export function swapSell(
  poolId: PoolId,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  dexFeePerToken: number,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(dexFeePerToken)
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.SwapSellSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    .with_constant(14, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(18, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(7, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      9,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(
      15,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString()))
    )
    .with_constant(
      16,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .to_base16_bytes()
}

export function swapBuy(
  poolId: PoolId,
  poolFeeNum: number,
  minQuoteAmount: bigint,
  dexFeePerToken: number,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(dexFeePerToken)
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.SwapBuySample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(11, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(15, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString()))
    )
    .with_constant(
      5,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .to_base16_bytes()
}
