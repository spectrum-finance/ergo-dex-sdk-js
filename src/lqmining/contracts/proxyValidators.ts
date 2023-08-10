import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {ErgoTreePrefixHex, SigmaPropConstPrefixHex} from "../../amm/common/constants"
import {fromHex} from "../../utils/hex"
import {PoolId} from "../types"
import {StakingBundleTreeBlake2b256} from "./templates"

export const depositSample = '19a2041904000e2002020202020202020202020202020202020202020202020202020202020202020e20000000000000000000000000000000000000000000000000000000000000000008cd02217daf90deb73bdf8b6709bb42093fdfaff6573fd47b630e2d3fdd4a8193a74d0404040a040204040400040005fcffffffffffffffff0104000e200508f3623d4b2be3bdb9737b3e65644f011167eefb830d9965205f022ceda40d04060400040804140402050204040e691005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a573040500050005a09c010100d803d601b2a4730000d6027301d6037302eb027303d195ed92b1a4730493b1db630872017305d805d604db63087201d605b2a5730600d606c57201d607b2a5730700d6088cb2db6308a773080002ededed938cb27204730900017202ed93c2720572039386027206730ab2db63087205730b00ededededed93cbc27207730c93d0e4c672070608720393e4c67207070e72029386028cb27204730d00017208b2db63087207730e009386028cb27204730f00019c72087e731005b2db6308720773110093860272067312b2db6308720773130090b0ada5d90109639593c272097314c1720973157316d90109599a8c7209018c72090273177318';

export const depositTemplate = 'd803d601b2a4730000d6027301d6037302eb027303d195ed92b1a4730493b1db630872017305d805d604db63087201d605b2a5730600d606c57201d607b2a5730700d6088cb2db6308a773080002ededed938cb27204730900017202ed93c2720572039386027206730ab2db63087205730b00ededededed93cbc27207730c93d0e4c672070608720393e4c67207070e72029386028cb27204730d00017208b2db63087207730e009386028cb27204730f00019c72087e731005b2db6308720773110093860272067312b2db6308720773130090b0ada5d90109639593c272097314c1720973157316d90109599a8c7209018c72090273177318';

export const redeemSample = '19d1020e08cd02217daf90deb73bdf8b6709bb42093fdfaff6573fd47b630e2d3fdd4a8193a74d04040400040a04020e691005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a573040500050005a09c010e2001010101010101010101010101010101010101010101010101010101010101010e20000000000000000000000000000000000000000000000000000000000000000005d00f04000100eb027300d195ed92b1a4730193b1db6308b2a47302007303d802d601b2a5730400d60290b0ada5d90102639593c272027305c1720273067307d90102599a8c7202018c7202027308ededed93c272017309938602730a730bb2db63087201730c0072027202730d';

export const redeemTemplate = 'eb027300d195ed92b1a4730193b1db6308b2a47302007303d802d601b2a5730400d60290b0ada5d90102639593c272027305c1720273067307d90102599a8c7202018c7202027308ededed93c272017309938602730a730bb2db63087201730c0072027202730d';

export function deposit(
  poolId: PoolId,
  redeemerPk: PublicKey,
  expectedNumEpochs: number,
  minerFee: bigint
): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(depositSample)
    .with_constant(1, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(
      2,
      RustModule.SigmaRust.Constant.from_byte_array(
        fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + redeemerPk)
      )
    )
    .with_constant(3, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + redeemerPk))
    .with_constant(12, RustModule.SigmaRust.Constant.from_byte_array(fromHex(StakingBundleTreeBlake2b256)))
    .with_constant(16, RustModule.SigmaRust.Constant.from_i32(expectedNumEpochs))
    .with_constant(
      23,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minerFee.toString()))
    )
    .to_base16_bytes()
}

export function redeem(
  redeemerPk: PublicKey,
  lqId: TokenId,
  expectedLqAmount: bigint,
  minerFee: bigint
): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(redeemSample)
    .with_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + redeemerPk))
    .with_constant(
      9,
      RustModule.SigmaRust.Constant.from_byte_array(
        fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + redeemerPk)
      )
    )
    .with_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(lqId)))
    .with_constant(
      11,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(expectedLqAmount.toString()))
    )
    .with_constant(
      8,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minerFee.toString()))
    )
    .to_base16_bytes()
}
