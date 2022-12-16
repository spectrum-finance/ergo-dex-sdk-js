import {ErgoTree, HexString, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import * as crypto from "crypto-js"
import {PoolContracts} from "../../contracts/poolContracts"
import {fromHex, toHex} from "../../utils/hex"
import {decimalToFractional} from "../../utils/math"
import {SigmaPropConstPrefixHex} from "../constants"
import {AmmPool} from "../entities/ammPool"
import {PoolId} from "../types"
import * as T2T from "./t2tTemplates"

export function pool(): ErgoTree {
  return T2T.PoolSample
}

export function poolTemplateHash(): HexString {
  const template = RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.PoolSample).template_bytes()
  return crypto.SHA256(crypto.enc.Hex.parse(toHex(template))).toString(crypto.enc.Hex)
}

export function poolBundle(): PoolContracts<AmmPool> {
  return {
    poolTree: pool(),
    poolTemplateHash: poolTemplateHash()
  }
}

export function depositNative(poolId: PoolId, pk: PublicKey, dexFee: bigint, maxMinerFee: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.DepositSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(13, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      15,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    .with_constant(
      25,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

export function redeemNative(poolId: PoolId, pk: PublicKey, dexFee: bigint, maxMinerFee: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.RedeemSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(13, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      15,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    .with_constant(
      19,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

export function swapNative(
  poolId: PoolId,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  dexFeePerToken: number,
  maxMinerFee: bigint,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(dexFeePerToken)
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.SwapSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(2, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    .with_constant(3, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(14, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      15,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(
      16,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString()))
    )
    .with_constant(
      17,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .with_constant(
      21,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}
