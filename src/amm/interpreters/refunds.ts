import {BoxSelection, ErgoTx, MinTransactionContext, Prover, TxAssembler} from "../../ergo"
import {RefundParams} from "../../models/refundParams"
import {ErgoNetwork} from "../../services/ergoNetwork"
import * as T2T from "../contracts/t2tTemplates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {TxRequest} from "../../ergo/wallet/entities/txRequest"
import {EmptyRegisters} from "../../ergo/entities/registers"
import {ergoTreeFromAddress} from "../../ergo/entities/ergoTree"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams, ctx: MinTransactionContext): Promise<ErgoTx>
}

export class AmmOrderRefunds implements Refunds {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async refund(params: RefundParams, ctx: MinTransactionContext): Promise<ErgoTx> {
    const tx = await this.network.getTx(params.txId)
    const allowedTemplates = [T2T.DepositTemplate, T2T.RedeemTemplate, T2T.SwapTemplate]
    const outputToRefund = tx?.outputs.find(o => {
      const template = treeTemplateFromErgoTree(o.ergoTree)
      return allowedTemplates.includes(template)
    })
    if (outputToRefund) {
      const inputs = BoxSelection.safe(outputToRefund)
      const refundOut = {
        value: outputToRefund.value - ctx.feeNErgs,
        ergoTree: ergoTreeFromAddress(params.recipientAddress),
        creationHeight: ctx.network.height,
        assets: outputToRefund.assets,
        additionalRegisters: EmptyRegisters
      }
      const txr: TxRequest = {
        inputs: inputs,
        dataInputs: [],
        outputs: [refundOut],
        changeAddress: params.recipientAddress,
        feeNErgs: ctx.feeNErgs
      }
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
