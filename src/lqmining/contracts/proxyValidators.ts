import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {ErgoTreePrefixHex, SigmaPropConstPrefixHex} from "../../amm/constants"
import {fromHex} from "../../utils/hex"
import {PoolId} from "../types"
import {StakingBundleTreeBlake2b256} from "./templates"

const depositSample =
  "19ee021204000e200202020202020202020202020202020202020202020202020202020202" +
  "02020204020e20000000000000000000000000000000000000000000000000000000000000" +
  "00000404040008cd02217daf90deb73bdf8b6709bb42093fdfaff6573fd47b630e2d3fdd4a" +
  "8193a74d040005fcffffffffffffffff0104000e2001010101010101010101010101010101" +
  "010101010101010101010101010101010406040004080414040205020404d808d601b2a473" +
  "0000d602db63087201d6037301d604b2a5730200d6057303d606c57201d607b2a5730400d6" +
  "088cb2db6308a773050002eb027306d1eded938cb27202730700017203ed93c27204720593" +
  "860272067308b2db63087204730900ededededed93cbc27207730a93e4c67207040e720593" +
  "e4c67207050e72039386028cb27202730b00017208b2db63087207730c009386028cb27202" +
  "730d00019c72087e730e05b2db63087207730f0093860272067310b2db63087207731100"

const redeemSample =
  "19a70206040208cd03d36d7e86b0fe7d8aec204f0ae6c2be6563fc7a443d69501d73dfe9c2" +
  "adddb15a0e69aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "0e69bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" +
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" +
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb05fe887a" +
  "0400d801d601b2a5730000eb027301d1ed93c27201730293860273037304b2db6308720173" +
  "0500"

export function deposit(poolId: PoolId, redeemerPk: PublicKey, expectedNumEpochs: number): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(depositSample)
    .with_constant(1, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      3,
      RustModule.SigmaRust.Constant.from_byte_array(
        fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + redeemerPk)
      )
    )
    .with_constant(6, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + redeemerPk))
    .with_constant(10, RustModule.SigmaRust.Constant.decode_from_base16(StakingBundleTreeBlake2b256))
    .with_constant(14, RustModule.SigmaRust.Constant.from_i32(expectedNumEpochs))
    .to_base16_bytes()
}

export function redeem(redeemerPk: PublicKey, lqId: TokenId, expectedLqAmount: bigint): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(redeemSample)
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
