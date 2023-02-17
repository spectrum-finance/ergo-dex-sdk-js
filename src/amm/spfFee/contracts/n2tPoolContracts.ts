import {ErgoTree, PublicKey, RustModule, TokenId} from "@ergolabs/ergo-sdk"
import {SpecExFee, SpecExFeePerToken} from "../../../types"
import {fromHex} from "../../../utils/hex"
import {decimalToFractional} from "../../../utils/math"
import {ErgoTreePrefixHex, SigmaFalseHex, SigmaPropConstPrefixHex, SigmaTrueHex} from "../../common/constants"
import {PoolId} from "../../common/types"
import * as N2T from "./n2tTemplates"

// {1}  -> SelfXAmount[Long]
// {2}  -> RefundProp[ProveDlog]
// {10} -> SpectrumIsY[Boolean]
// {11} -> ExFee[Long]
// {14} -> PoolNFT[Coll[Byte]]
// {15} -> RedeemerPropBytes[Coll[Byte]]
// {20} -> MinerPropBytes[Coll[Byte]]
// {23} -> MaxMinerFee[Long]
export function deposit(
  poolId: PoolId,
  pk: PublicKey,
  selfX: bigint,
  exFee: SpecExFee,
  maxMinerFee: bigint,
  specIsY: boolean,
): ErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.DepositSample)
    .with_constant(
      1,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(selfX.toString()))
    )
    .with_constant(2, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(10, RustModule.SigmaRust.Constant.from_js(specIsY))
    .with_constant(11, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(exFee.amount.toString())))
    .with_constant(14, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(15, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(
      23,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

// {1}  -> RefundProp[ProveDlog]
// {11} -> PoolNFT[Coll[Byte]]
// {12} -> RedeemerPropBytes[Coll[Byte]]
// {13} -> MinerPropBytes[Coll[Byte]]
// {16} -> MaxMinerFee[Long]
export function redeem(poolId: PoolId, pk: PublicKey, exFee: SpecExFee, maxMinerFee: bigint): ErgoTree {
  console.log(exFee);
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.RedeemSample)
    .with_constant(1, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(11, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(12, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(
      16,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()
}

// {1} -> ExFeePerTokenDenom[Long]
// {2} -> Delta[Long]
// {3} -> BaseAmount[Long]
// {4} -> FeeNum[Int]
// {5} -> RefundProp[ProveDlog]
// {10} -> SpectrumIsQuote[Boolean]
// {11} -> MaxExFee[Long]
// {13} -> PoolNFT[Coll[Byte]]
// {14} -> RedeemerPropBytes[Coll[Byte]]
// {15} -> QuoteId[Coll[Byte]]
// {16} -> MinQuoteAmount[Long]
// {23} -> SpectrumId[Coll[Byte]]
// {27} -> FeeDenom[Int]
// {31} -> MaxMinerFee[Long]
export function swapSell(
  poolId: PoolId,
  baseAmount: bigint,
  poolFeeNum: number,
  quoteId: TokenId,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  specIsQuote: boolean,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount);

  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.SwapSellSample)
    .with_constant(1, RustModule.SigmaRust.Constant.from_i64(
      RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
    ))
    .with_constant(2, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str((dexFeePerTokenDenom - dexFeePerTokenNum).toString())))
    .with_constant(3, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(baseAmount.toString())))
    .with_constant(4, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(5, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(10, RustModule.SigmaRust.Constant.decode_from_base16(specIsQuote ? SigmaTrueHex : SigmaFalseHex))
    .with_constant(11, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxExFee.toString())))
    .with_constant(13, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(14, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(15, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
    .with_constant(16, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString())))
    .with_constant(23, RustModule.SigmaRust.Constant.from_byte_array(fromHex(exFeePerToken.tokenId)))
    .with_constant(27, RustModule.SigmaRust.Constant.from_i32(1000))
    .with_constant(31, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString())))
    .to_base16_bytes()
}

// {1}  -> BaseAmount[Long]
// {2}  -> FeeNum[Int]
// {3}  -> RefundProp[ProveDlog]
// {7}  -> MaxExFee[Long]
// {8}  -> ExFeePerTokenDenom[Long]
// {9}  -> ExFeePerTokenNum[Long]
// {11} -> PoolNFT[Coll[Byte]]
// {12} -> RedeemerPropBytes[Coll[Byte]]
// {13} -> MinQuoteAmount[Long]
// {16} -> SpectrumId[Coll[Byte]]
// {20} -> FeeDenom[Int]
// {24} -> MaxMinerFee[Long]
export function swapBuy(
  poolId: PoolId,
  baseAmount: bigint,
  poolFeeNum: number,
  minQuoteAmount: bigint,
  exFeePerToken: SpecExFeePerToken,
  maxMinerFee: bigint,
  maxExFee: bigint,
  pk: PublicKey
): ErgoTree {
  const [dexFeePerTokenNum, dexFeePerTokenDenom] = decimalToFractional(exFeePerToken.amount);
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(N2T.SwapBuySample)
    .with_constant(1, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(baseAmount.toString())))
    .with_constant(2, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
    .with_constant(3, RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(7, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxExFee.toString())))
    .with_constant(
      8,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenDenom.toString())
      )
    )
    .with_constant(
      9,
      RustModule.SigmaRust.Constant.from_i64(
        RustModule.SigmaRust.I64.from_str(dexFeePerTokenNum.toString())
      )
    )

    .with_constant(11, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
    .with_constant(12, RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + pk)
    ))
    .with_constant(
      13,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString()))
    )
    .with_constant(16, RustModule.SigmaRust.Constant.from_byte_array(fromHex(exFeePerToken.tokenId)))
    .with_constant(20, RustModule.SigmaRust.Constant.from_i32(1000))
    .with_constant(
      24,
      RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(maxMinerFee.toString()))
    )
    .to_base16_bytes()

}
