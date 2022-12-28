import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {ErgoTreePrefixHex, SigmaPropConstPrefixHex} from "../../amm/constants"
import {fromHex} from "../../utils/hex"
import {PoolId} from "../types"

const depositSample =
  "198c031104000e2000000000000000000000000000000000000000000000000000000000000000" +
  "0004020e69aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0404040008cd03" +
  "d36d7e86b0fe7d8aec204f0ae6c2be6563fc7a443d69501d73dfe9c2adddb15a040005fcffffff" +
  "ffffffffff01040004060400040805f00d040205020404d808d601b2a4730000d602db63087201" +
  "d6037301d604b2a5730200d6057303d606c57201d607b2a5730400d6088cb2db6308a773050002" +
  "eb027306d1eded938cb27202730700017203ed93c27204720593860272067308b2db6308720473" +
  "0900edededed93e4c67207040e720593e4c67207050e72039386028cb27202730a00017208b2db" +
  "63087207730b009386028cb27202730c00019c7208730db2db63087207730e009386027206730f" +
  "b2db63087207731000"

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
