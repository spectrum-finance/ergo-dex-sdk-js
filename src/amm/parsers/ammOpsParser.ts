import {AssetAmount, BoxId, ErgoTx} from "../../ergo"
import {T2tDepositTemplate, T2tPoolTemplate, T2tRedeemTemplate, T2tSwapTemplate} from "../contracts/templates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {OperationSummary} from "../models/operationSummary"
import {Swap, Deposit, Redeem, Setup} from "../models/ammOperation"
import {RustModule} from "../../utils/rustLoader"
import {toHex} from "../../utils/hex"

export interface AmmOpsParser {
  parse(tx: ErgoTx): [OperationSummary, BoxId] | undefined
}

const AmmTemplates = [
  [T2tPoolTemplate, Setup],
  [T2tSwapTemplate, Swap],
  [T2tDepositTemplate, Deposit],
  [T2tRedeemTemplate, Redeem]
]

export class DefaultAmmOpsParser implements AmmOpsParser {
  parse(tx: ErgoTx): [OperationSummary, BoxId] | undefined {
    return tx.outputs
      .map((bx, _ix, _xs) => {
        const template = treeTemplateFromErgoTree(bx.ergoTree)
        const match = AmmTemplates.find(x => {
          const [sample] = x
          return template === sample
        })
        let op: OperationSummary | undefined = undefined
        if (match) {
          const [, type] = match
          const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(bx.ergoTree)
          switch (type) {
            case Swap:
              const poolIdC = tree.get_constant(10)?.to_byte_array()
              const poolId = poolIdC ? toHex(poolIdC) : undefined
              const outIdC = tree.get_constant(3)?.to_byte_array()
              const outId = outIdC ? toHex(outIdC) : undefined
              const input = bx.assets[0]
              if (poolId && outId) op = {from: AssetAmount.fromToken(input), to: {id: outId}, poolId}
          }
        }
        return op ? ([op, bx.boxId] as [OperationSummary, BoxId]) : undefined
      })
      .find(x => x)
  }
}
