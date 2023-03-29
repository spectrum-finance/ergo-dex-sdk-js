import {
  AssetAmount,
  ErgoBox,
  ErgoTreeTemplate,
  NativeAssetInfo,
  RustModule,
  treeTemplateFromErgoTree
} from "@ergolabs/ergo-sdk"
import {toHex} from "../../../utils/hex"
import * as NativeFeeN2T from "../../nativeFee/contracts/n2tTemplates"
import * as NativeFeeT2T from "../../nativeFee/contracts/t2tTemplates"
import * as SpfFeeN2T from "../../spfFee/contracts/n2tTemplates"
import * as SpfFeeT2T from "../../spfFee/contracts/t2tTemplates"
import {AmmOrderInfo} from "../models/ammOrderInfo"
import {AmmOrderType} from "../models/operations"

export interface AmmOrdersParser {
  parse(box: ErgoBox): AmmOrderInfo | undefined
}

interface ParserIn {
  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined

  parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined

  parseRedeem(bx: ErgoBox): AmmOrderInfo | undefined
}

abstract class T2TParserIn {
  abstract getSwapPoolIdC(tree: any): Uint8Array

  abstract getSwapOutIdC(tree: any): Uint8Array

  abstract getDepositPoolIdC(tree: any): Uint8Array

  abstract getRedeemPoolIdC(tree: any): Uint8Array

  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = this.getSwapPoolIdC(tree)
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const outIdC = this.getSwapOutIdC(tree)
      const outId = outIdC ? toHex(outIdC) : undefined
      const input = bx.assets[0]
      return poolId && outId
        ? {from: AssetAmount.fromToken(input), to: {id: outId}, poolId, type: "swap"}
        : undefined
    } catch (e) {
      return undefined
    }
  }

  parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = this.getDepositPoolIdC(tree)
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputX = bx.assets[0]
      const inputY = bx.assets[1]
      return poolId && inputX && inputY
        ? {inX: AssetAmount.fromToken(inputX), inY: AssetAmount.fromToken(inputY), poolId, type: "deposit"}
        : undefined
    } catch (e) {
      return undefined
    }
  }

  parseRedeem(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = this.getRedeemPoolIdC(tree)
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputLP = bx.assets[0]
      return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
    } catch (e) {
      return undefined
    }
  }
}

class NativeFeeT2tParserIn extends T2TParserIn {
  getSwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(14)?.to_byte_array()
  }

  getSwapOutIdC(tree: any): Uint8Array {
    return tree.get_constant(2)?.to_byte_array()
  }

  getDepositPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(13)?.to_byte_array()
  }

  getRedeemPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(13)?.to_byte_array()
  }
}

class SpfFeeT2tParserIn extends T2TParserIn {
  getSwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(18)?.to_byte_array()
  }

  getSwapOutIdC(tree: any): Uint8Array {
    return tree.get_constant(1)?.to_byte_array()
  }

  getDepositPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(13)?.to_byte_array()
  }

  getRedeemPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(13)?.to_byte_array()
  }
}

abstract class N2TParserIn {
  abstract getSellSwapPoolIdC(tree: any): Uint8Array

  abstract getSellSwapOutIdC(tree: any): Uint8Array

  abstract getBuySwapPoolIdC(tree: any): Uint8Array

  abstract getDepositPoolIdC(tree: any): Uint8Array

  abstract getRedeemPoolIdC(tree: any): Uint8Array

  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      return bx.assets.length > 0 ? this.parseBuySwap(bx) : this.parseSellSwap(bx)
    } catch (e) {
      return undefined
    }
  }

  private parseSellSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = this.getSellSwapPoolIdC(tree)
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const outIdC = this.getSellSwapOutIdC(tree)
    const outId = outIdC ? toHex(outIdC) : undefined
    return poolId && outId
      ? {from: AssetAmount.native(bx.value), to: {id: outId}, poolId, type: "swap"}
      : undefined
  }

  private parseBuySwap(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = this.getBuySwapPoolIdC(tree)
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const input = bx.assets[0]
    return poolId
      ? {from: AssetAmount.fromToken(input), to: NativeAssetInfo, poolId, type: "swap"}
      : undefined
  }

  parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = this.getDepositPoolIdC(tree)
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputY = bx.assets[0]
      return poolId && inputY
        ? {inX: AssetAmount.native(bx.value), inY: AssetAmount.fromToken(inputY), poolId, type: "deposit"}
        : undefined
    } catch (e) {
      return undefined
    }
  }

  parseRedeem(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = this.getRedeemPoolIdC(tree)
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputLP = bx.assets[0]
      return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
    } catch (e) {
      return undefined
    }
  }
}

class NativeFeeN2TParserIn extends N2TParserIn {
  getSellSwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(8)?.to_byte_array()
  }

  getSellSwapOutIdC(tree: any): Uint8Array {
    return tree.get_constant(9)?.to_byte_array()
  }

  getBuySwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(9)?.to_byte_array()
  }

  getDepositPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(12)?.to_byte_array()
  }

  getRedeemPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(11)?.to_byte_array()
  }
}

class SpfFeeN2TParserIn extends N2TParserIn {
  getSellSwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(13)?.to_byte_array()
  }

  getSellSwapOutIdC(tree: any): Uint8Array {
    return tree.get_constant(15)?.to_byte_array()
  }

  getBuySwapPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(11)?.to_byte_array()
  }

  getDepositPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(12)?.to_byte_array()
  }

  getRedeemPoolIdC(tree: any): Uint8Array {
    return tree.get_constant(11)?.to_byte_array()
  }
}

const nativeFeeT2tParser = new NativeFeeT2tParserIn()
const spfFeeT2tParser = new SpfFeeT2tParserIn()
const nativeFeeN2tParser = new NativeFeeN2TParserIn()
const spfFeeN2TParserIn = new SpfFeeN2TParserIn()

const AmmTemplates: [ErgoTreeTemplate, AmmOrderType, ParserIn][] = [
  [NativeFeeT2T.SwapTemplate, "swap", nativeFeeT2tParser],
  [NativeFeeT2T.DepositTemplate, "deposit", nativeFeeT2tParser],
  [NativeFeeT2T.RedeemTemplate, "redeem", nativeFeeT2tParser],
  [NativeFeeN2T.SwapSellTemplate, "swap", nativeFeeN2tParser],
  [NativeFeeN2T.SwapBuyTemplate, "swap", nativeFeeN2tParser],
  [NativeFeeN2T.DepositTemplate, "deposit", nativeFeeN2tParser],
  [NativeFeeN2T.RedeemTemplate, "redeem", nativeFeeN2tParser],

  [SpfFeeT2T.SwapTemplate, "swap", spfFeeT2tParser],
  [SpfFeeT2T.DepositTemplate, "deposit", spfFeeT2tParser],
  [SpfFeeT2T.RedeemTemplate, "redeem", spfFeeT2tParser],
  [SpfFeeN2T.SwapSellTemplate, "swap", spfFeeN2TParserIn],
  [SpfFeeN2T.SwapBuyTemplate, "swap", spfFeeN2TParserIn],
  [SpfFeeN2T.DepositTemplate, "deposit", spfFeeN2TParserIn],
  [SpfFeeN2T.RedeemTemplate, "redeem", spfFeeN2TParserIn]
]

export class DefaultAmmOrdersParser implements AmmOrdersParser {
  parse(bx: ErgoBox): AmmOrderInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    const match = AmmTemplates.find(x => {
      const [sample] = x
      return template === sample
    })
    if (match) {
      const [, type, parser] = match
      switch (type) {
        case "swap":
          return parser.parseSwap(bx)
        case "deposit":
          return parser.parseDeposit(bx)
        case "redeem":
          return parser.parseRedeem(bx)
      }
    } else {
      return undefined
    }
  }
}
