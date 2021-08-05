import {AssetAmount, ErgoBox} from "../../ergo"
import {T2tDepositTemplate, T2tRedeemTemplate, T2tSwapTemplate} from "../contracts/templates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {AmmOrderType} from "../models/operations"
import {RustModule} from "../../utils/rustLoader"
import {toHex} from "../../utils/hex"
import {AmmOrderInfo} from "../models/ammOrderInfo"

export interface AmmOrdersParser {
  parse(box: ErgoBox): AmmOrderInfo | undefined
}

const AmmTemplates: [string, AmmOrderType][] = [
  [T2tSwapTemplate, "swap"],
  [T2tDepositTemplate, "deposit"],
  [T2tRedeemTemplate, "redeem"]
]

export class DefaultAmmOrdersParser implements AmmOrdersParser {
  parse(bx: ErgoBox): AmmOrderInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    const match = AmmTemplates.find(x => {
      const [sample] = x
      return template === sample
    })
    if (match) {
      const [, type] = match
      switch (type) {
        case "swap":
          return this.parseSwap(bx)
        case "deposit":
          return this.parseDeposit(bx)
        case "redeem":
          return this.parseRedeem(bx)
      }
    } else {
      return undefined
    }
  }

  private parseSwap(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(14)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const outIdC = tree.get_constant(2)?.to_byte_array()
    const outId = outIdC ? toHex(outIdC) : undefined
    const input = bx.assets[0]
    return poolId && outId
      ? {from: AssetAmount.fromToken(input), to: {id: outId}, poolId, type: "swap"}
      : undefined
  }

  private parseDeposit(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(9)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const inputX = bx.assets[0]
    const inputY = bx.assets[1]
    return poolId && inputX && inputY
      ? {inX: AssetAmount.fromToken(inputX), inY: AssetAmount.fromToken(inputX), poolId, type: "deposit"}
      : undefined
  }

  private parseRedeem(bx: ErgoBox): AmmOrderInfo | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(13)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const inputLP = bx.assets[0]
    return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
  }
}
