import {PoolId} from "../types"
import * as templates from "./templates"
import {HexString, NErg, TokenId, ErgoTree, PublicKey} from "../../ergo"
import {fromHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"

export class T2tPoolContracts {

  static pool(emissionLP: bigint): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tPool)
    tree.set_constant(
      7,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString()))
    )
    tree.set_constant(
      8,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString()))
    )
    return tree.to_base16_bytes()
  }

  static poolTemplateHash(): HexString {
    return templates.T2tPoolHash
  }

  static deposit(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tDeposit)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk))
    tree.set_constant(
      5,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString()))
    )
    tree.set_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    tree.set_constant(
      10,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    return tree.to_base16_bytes()
  }

  static redeem(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tRedeem)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk))
    tree.set_constant(
      7,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString()))
    )
    tree.set_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    tree.set_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString()))
    )
    return tree.to_base16_bytes()
  }

  static swap(
    poolScriptHash: HexString,
    poolFeeNum: number,
    quoteId: TokenId,
    minQuoteAmount: bigint,
    dexFeePerToken: NErg,
    pk: PublicKey
  ): ErgoTree {
    let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tSwap)
    tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk)) // todo: is that correct?
    tree.set_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    tree.set_constant(8, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    tree.set_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolScriptHash)))
    tree.set_constant(
      11,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    tree.set_constant(
      12,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerToken.toString()))
    )
    return tree.to_base16_bytes()
  }
}
