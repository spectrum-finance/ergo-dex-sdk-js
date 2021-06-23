import {PoolId} from "../types"
import * as templates from "./templates"
import {NErg, TokenId, ErgoTree, PublicKey} from "../../ergo"
import {fromHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"
import {SigmaPropConstPrefixHex} from "../constants"

export class T2tPoolContracts {
  static pool(): ErgoTree {
    return templates.T2tPool
  }

  static deposit(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tDeposit)
      .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
      .with_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
      .with_constant(
        10,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
      )
      .to_base16_bytes()
  }

  static redeem(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tRedeem)
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
    dexFeePerToken: NErg,
    pk: PublicKey
  ): ErgoTree {
    return RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tSwap)
      .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
      .with_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
      .with_constant(8, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
      .with_constant(9, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
      .with_constant(11, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
      .with_constant(
        13,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
      )
      .with_constant(
        14,
        RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerToken.toString()))
      )
      .to_base16_bytes()
  }
}
