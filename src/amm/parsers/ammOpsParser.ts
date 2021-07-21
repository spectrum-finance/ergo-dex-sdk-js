import {AssetAmount, ErgoBox} from "../../ergo"
import {T2tDepositTemplate, T2tPoolTemplate, T2tRedeemTemplate, T2tSwapTemplate} from "../contracts/templates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {OperationSummary} from "../models/operationSummary"
import {Swap, Deposit, Redeem, Setup, AmmOperationType} from "../models/ammOperation"
import {RustModule} from "../../utils/rustLoader"
import {toHex} from "../../utils/hex"

export interface AmmOpsParser {
  parse(box: ErgoBox): OperationSummary | undefined
}

const AmmTemplates: [string, AmmOperationType][] = [
  [T2tPoolTemplate, Setup],
  [T2tSwapTemplate, Swap],
  [T2tDepositTemplate, Deposit],
  [T2tRedeemTemplate, Redeem]
]

export class DefaultAmmOpsParser implements AmmOpsParser {
  parse(bx: ErgoBox): OperationSummary | undefined {
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
        case "setup":
          return this.parseSetup(bx)
      }
    } else {
      return undefined
    }
  }

  private parseSwap(bx: ErgoBox): OperationSummary | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(10)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const outIdC = tree.get_constant(3)?.to_byte_array()
    const outId = outIdC ? toHex(outIdC) : undefined
    const input = bx.assets[0]
    return poolId && outId
      ? {from: AssetAmount.fromToken(input), to: {id: outId}, poolId, type: "swap"}
      : undefined
  }

  private parseDeposit(bx: ErgoBox): OperationSummary | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(8)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const inputX = bx.assets[0]
    const inputY = bx.assets[1]
    return poolId && inputX && inputY
      ? {inX: AssetAmount.fromToken(inputX), inY: AssetAmount.fromToken(inputX), poolId, type: "deposit"}
      : undefined
  }

  private parseRedeem(bx: ErgoBox): OperationSummary | undefined {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
    const poolIdC = tree.get_constant(10)?.to_byte_array()
    const poolId = poolIdC ? toHex(poolIdC) : undefined
    const inputLP = bx.assets[0]
    return poolId && inputLP ? {inLP: AssetAmount.fromToken(inputLP), poolId, type: "redeem"} : undefined
  }

  private parseSetup(bx: ErgoBox): OperationSummary | undefined {
    const poolId = bx.assets[0]?.tokenId
    const inputX = bx.assets[2]
    const inputY = bx.assets[3]
    return poolId && inputX && inputY
      ? {initX: AssetAmount.fromToken(inputX), initY: AssetAmount.fromToken(inputY), poolId, type: "setup"}
      : undefined
  }
}
