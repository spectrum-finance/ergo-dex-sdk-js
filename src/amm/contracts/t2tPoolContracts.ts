import {PoolId} from "../types"
import * as templates from "./templates"
import {TokenId, ErgoTree, PublicKey, HexString} from "../../ergo"
import {fromHex, toHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"
import {SigmaPropConstPrefixHex} from "../constants"
import * as crypto from "crypto-js"

export class T2tPoolContracts {
  static pool(): ErgoTree {
    return templates.T2tPoolSample
  }

  static poolTemplateHash(): HexString {
    const template = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tPoolSample).template_bytes()
    return crypto.SHA256(crypto.enc.Hex.parse(toHex(template))).toString(crypto.enc.Hex)
  }

  static deposit(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tDepositSample)
      .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
      .with_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
      .with_constant(
        10,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
      )
      .to_base16_bytes()
  }

  static redeem(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tRedeemSample)
      .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
      .with_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
      .with_constant(
        12,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
      )
      .to_base16_bytes()
  }

  static swap(
    poolId: PoolId,
    poolFeeNum: number,
    quoteId: TokenId,
    minQuoteAmount: bigint,
    dexFeePerToken: number,
    pk: PublicKey
  ): ErgoTree {
    const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(dexFeePerToken)
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tSwapSample)
      .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
      .with_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
      .with_constant(7, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
      .with_constant(8, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
      .with_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
      .with_constant(
        13,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
      )
      .with_constant(
        14,
        RustModule.SigmaRust.Constant.from_i64(
          RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString())
        )
      )
      .with_constant(
        15,
        RustModule.SigmaRust.Constant.from_i64(
          RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
        )
      )
      .to_base16_bytes()
  }
}

export function decimalToFractional(n: number): [bigint, bigint] {
  const [whole, decimals = ""] = String(n).split(".")
  const numDecimals = decimals.length
  const denominator = BigInt(Math.pow(10, numDecimals))
  const numerator = BigInt(whole) * denominator + BigInt(decimals)
  return [numerator, denominator]
}
