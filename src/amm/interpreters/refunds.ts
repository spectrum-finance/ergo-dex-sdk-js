import {ErgoTx, Prover, TransactionContext, TxAssembler} from "../../ergo"
import {RefundParams} from "../../models/refundParams"
import {ErgoNetwork} from "../../services/ergoNetwork"
import * as templates from "../contracts/templates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {TxRequest} from "../../ergo/wallet/entities/txRequest"
import {EmptyRegisters} from "../../ergo/entities/registers"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams, ctx: TransactionContext): Promise<ErgoTx>
}

export class AMMOrderRefunds implements Refunds {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async refund(params: RefundParams, ctx: TransactionContext): Promise<ErgoTx> {
    const tx = await this.network.getTx(params.txId)
    const allowedScripts = [templates.T2tDeposit, templates.T2tRedeem, templates.T2tSwap]
    const allowedTemplates = allowedScripts.map((t, _ix, _xs) => treeTemplateFromErgoTree(t))
    const outputToRefund = tx?.outputs.find((o, _ix, _xs) => {
      const template = treeTemplateFromErgoTree(o.ergoTree)
      allowedTemplates.includes(template)
    })
    if (outputToRefund) {
      const inputs = ctx.inputs.addInput(outputToRefund)
      const refundOut = {
        value: outputToRefund.value,
        ergoTree: params.recipientAddress,
        creationHeight: ctx.network.height,
        assets: outputToRefund.assets,
        additionalRegisters: EmptyRegisters
      }
      const txr: TxRequest = {
        inputs: inputs,
        dataInputs: [],
        outputs: [refundOut],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs
      }
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
