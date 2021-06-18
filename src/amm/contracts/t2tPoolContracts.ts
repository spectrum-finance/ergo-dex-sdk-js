import { PoolId } from "../types"
import * as templates from "./templates"
import { NErg, TokenId, ErgoTree, PublicKey, HexString } from "../../ergo"
import { fromHex } from "../../utils/hex"
import { RustModule } from "../../utils/rustLoader"

const SigmaPropConstPrefixHex: HexString = "07"

export class T2tPoolContracts {

  static pool(): ErgoTree {
    return templates.T2tPool
  }

  static deposit(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tDeposit)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    tree.set_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    tree.set_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    return tree.to_base16_bytes()
  }

  static redeem(poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tRedeem)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    tree.set_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    tree.set_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    return tree.to_base16_bytes()
  }

  static swap(
    poolId: PoolId,
    poolFeeNum: number,
    quoteId: TokenId,
    minQuoteAmount: bigint,
    dexFeePerToken: NErg,
    pk: PublicKey
  ): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tSwap)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    tree.set_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    tree.set_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    tree.set_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    tree.set_constant(
      13,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerToken.toString()))
    )
    tree.set_constant(14, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    tree.set_constant(15, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    return tree.to_base16_bytes()
  }
}
