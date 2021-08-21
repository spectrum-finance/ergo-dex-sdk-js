import {AssetAmount, ErgoBox} from "../../ergo"
import {NativeAssetInfo} from "../../ergo/entities/assetInfo"
import * as T2T from "../contracts/t2tTemplates"
import * as N2T from "../contracts/n2tTemplates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {AmmOrderType} from "../models/operations"
import {RustModule} from "../../utils/rustLoader"
import {toHex} from "../../utils/hex"
import {AmmOrderInfo} from "../models/ammOrderInfo"

export interface AmmOrdersParser {
  parse(box: ErgoBox): AmmOrderInfo | undefined
}

interface ParserIn {
  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined

  parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined

  parseRedeem(bx: ErgoBox): AmmOrderInfo | undefined
}

class T2TParserIn {
  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = tree.get_constant(14)?.to_byte_array()
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const outIdC = tree.get_constant(2)?.to_byte_array()
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
      const poolIdC = tree.get_constant(9)?.to_byte_array()
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
      const poolIdC = tree.get_constant(13)?.to_byte_array()
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputLP = bx.assets[0]
      return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
    } catch (e) {
      return undefined
    }
  }
}

class N2TParserIn {
  parseSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      return bx.assets.length > 0 ? this.parseBuySwap(bx) : this.parseSellSwap(bx)
    } catch (e) {
      return undefined
    }
  }

  private parseSellSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(7)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const outIdC = tree.get_constant(8)?.to_byte_array()
    const outId = outIdC ? toHex(outIdC) : undefined
    return poolId && outId
      ? {from: AssetAmount.native(bx.value), to: {id: outId}, poolId, type: "swap"}
      : undefined
  }

  private parseBuySwap(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(9)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const input = bx.assets[0]
    return poolId
      ? {from: AssetAmount.fromToken(input), to: NativeAssetInfo, poolId, type: "swap"}
      : undefined
  }

  parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined {
    try {
      const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
      const poolIdC = tree.get_constant(9)?.to_byte_array()
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
      const poolIdC = tree.get_constant(11)?.to_byte_array()
      const poolId = poolIdC ? toHex(poolIdC) : undefined
      const inputLP = bx.assets[0]
      return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
    } catch (e) {
      return undefined
    }
  }
}

const t2tParser = new T2TParserIn()
const n2tParser = new N2TParserIn()

const AmmTemplates: [string, AmmOrderType, ParserIn][] = [
  [T2T.SwapTemplate, "swap", t2tParser],
  [T2T.DepositTemplate, "deposit", t2tParser],
  [T2T.RedeemTemplate, "redeem", t2tParser],
  [N2T.SwapSellTemplate, "swap", n2tParser],
  [N2T.SwapBuyTemplate, "swap", n2tParser],
  [N2T.DepositTemplate, "deposit", n2tParser],
  [N2T.RedeemTemplate, "redeem", n2tParser]
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
