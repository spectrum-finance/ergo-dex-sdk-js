import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {ErgoTreePrefixHex, SigmaPropConstPrefixHex} from "../../amm/constants"
import {fromHex} from "../../utils/hex"
import {PoolId} from "../types"

const depositSample =
  "19f3020f040004020e69aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0404\n" +
  "040008cd03d36d7e86b0fe7d8aec204f0ae6c2be6563fc7a443d69501d73dfe9c2adddb15a0400\n" +
  "0e20000000000000000000000000000000000000000000000000000000000000000005feffffff\n" +
  "ffffffffff01040004060400040805f00d0402d807d601b2a4730000d602db63087201d603b2a5\n" +
  "730100d6047302d605c57201d606b2a5730300d6078cb2db6308a773040002eb027305d1eded93\n" +
  "8cb27202730600017307ed93c27203720493860272057308b2db63087203730900ededed93e4c6\n" +
  "7206040e720493e4c67206050e72059386028cb27202730a00017207b2db63087206730b009386\n" +
  "028cb27202730c00019c7207730db2db63087206730e00"

export function deposit(poolId: PoolId, redeemerPk: PublicKey, expectedNumEpochs: number): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(depositSample)
    .with_constant(
      2,
      RustModule.SigmaRust.Constant.from_byte_array(
        fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + redeemerPk)
      )
    )
    .with_constant(5, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + redeemerPk))
    .with_constant(7, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(13, RustModule.SigmaRust.Constant.from_i32(expectedNumEpochs))
    .to_base16_bytes()
}

export function redeem(redeemerPk: PublicKey, lqId: TokenId, expectedLqAmount: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(depositSample)
    .with_constant(1, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + redeemerPk))
    .with_constant(
      2,
      RustModule.SigmaRust.Constant.from_byte_array(
        fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + redeemerPk)
      )
    )
    .with_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(lqId)))
    .with_constant(
      4,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(expectedLqAmount.toString()))
    )
    .to_base16_bytes()
}
