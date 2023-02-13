import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {SpecExFee, SpecExFeePerToken} from "../../../types"
import {fromHex} from "../../../utils/hex"
import {decimalToFractional} from "../../../utils/math"
import {ErgoTreePrefixHex, SigmaPropConstPrefixHex} from "../../common/constants"
import {PoolId} from "../../common/types"
import * as T2T from "./t2tTemplates"

// Constants:
//
// {1}  -> RefundProp[ProveDlog]
// {8}  -> SelfXAmount[Long] // SELF.tokens(0)._2 - ExFee
// {10} -> SelfYAmount[Long] // SELF.tokens(1)._2 - ExFee
// {13} -> PoolNFT[Coll[Byte]]
// {14} -> RedeemerPropBytes[Coll[Byte]]
// {21} -> MinerPropBytes[Coll[Byte]]
// {24} -> MaxMinerFee[Long]
export function deposit(
  poolId: PoolId,
  pk: PublicKey,
  dexFee: SpecExFee,
  maxMinerFee: bigint,
  selfXAmount: bigint,
  selfYAmount: bigint
): ErgoTree {
  console.log(dexFee);
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.DepositSample)
    .with_constant(1, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(8, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfXAmount.toString())))
    .with_constant(10, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfYAmount.toString())))
    .with_constant(13, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(14, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(
      24,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

// {1}  -> RefundProp[ProveDlog]
// {13} -> PoolNFT[Coll[Byte]]
// {14} -> RedeemerPropBytes[Coll[Byte]]
// {15} -> MinerPropBytes[Coll[Byte]]
// {18} -> MaxMinerFee[Long]
export function redeem(
  poolId: PoolId,
  pk: PublicKey,
  dexFee: SpecExFee,
  maxMinerFee: bigint
): ErgoTree {
  console.log(dexFee);
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.RedeemSample)
    .with_constant(1, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(13, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(14, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(
      18,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

// Constants:
// {1} -> QuoteId[Coll[Byte]]
// {2} -> RefundProp[ProveDlog]
// {7} -> SpectrumIsQuote[Boolean]
// {8} -> MaxExFee[Long]
// {12} -> BaseAmount[Long]
// {13} -> FeeNum[Int]
// {17} -> PoolNFT[Coll[Byte]]
// {18} -> RedeemerPropBytes[Coll[Byte]]
// {19} -> MinQuoteAmount[Long]
// {23} -> ExFeePerTokenNum[Long]
// {24} -> ExFeePerTokenDenom[Long]
// {27} -> SpectrumId[Coll[Byte]]
// {29} -> FeeDenom[Int]
// {31} -> MinerPropBytes[Coll[Byte]]
// {34} -> MaxMinerFee[Long]
export function swap(
  poolId: PoolId,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  baseAmount: bigint,
  specIsQuote: boolean,
  pk: PublicKey,
): ErgoTree {
  const [exFeePerTokenNum, exFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount);
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(T2T.SwapSample)
    .with_constant(1, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    .with_constant(2, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(7, RustModule.SigmaRust.Constant.from_js(specIsQuote))
    .with_constant(8, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxExFee.toString())))
    .with_constant(12, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(baseAmount.toString())))
    .with_constant(13, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(17, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(18, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(19, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString())))
    .with_constant(
      23,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(exFeePerTokenNum.toString()))
    )
    .with_constant(
      24,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(exFeePerTokenDenom.toString())
      )
    )
    .with_constant(27, RustModule.SigmaRust.Constant.from_byte_array(fromHex(exFeePerToken.tokenId)))
    .with_constant(29, RustModule.SigmaRust.Constant.from_i32(1000))
    .with_constant(34, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString())))
    .to_base16_bytes()
}
