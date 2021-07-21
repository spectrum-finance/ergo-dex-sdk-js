import {ErgoTx, Prover, TransactionContext, TxAssembler} from "../../ergo"
import {RefundParams} from "../../models/refundParams"
import {ErgoNetwork} from "../../services/ergoNetwork"
import * as templates from "../contracts/templates"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import {TxRequest} from "../../ergo/wallet/entities/txRequest"
import {EmptyRegisters} from "../../ergo/entities/registers"
import {ergoTreeFromAddress} from "../../ergo/entities/ergoTree"
import {EmptyProverResult} from "../../ergo/entities/proverResult"
import {computeBoxId} from "../../ergo/ergoWasmInterop"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams, ctx: TransactionContext): Promise<ErgoTx>
}

export class AmmOrderRefunds implements Refunds {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async refund(params: RefundParams, ctx: TransactionContext): Promise<ErgoTx> {
    const tx = await this.network.getTx(params.txId)
    const allowedTemplates = [
      templates.T2tDepositTemplate,
      templates.T2tRedeemTemplate,
      templates.T2tSwapTemplate
    ]
    const outputToRefund = tx?.outputs.find(o => {
      const template = treeTemplateFromErgoTree(o.ergoTree)
      return allowedTemplates.includes(template)
    })
    if (outputToRefund) {
      const inputs = ctx.inputs.addInput(outputToRefund)
      const refundOut = {
        value: outputToRefund.value,
        ergoTree: ergoTreeFromAddress(params.recipientAddress),
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
      const tx = this.txAsm.assemble(txr, ctx.network)
      const refundInput = {boxId: outputToRefund.boxId, spendingProof: EmptyProverResult}
      const signedInputs = await Promise.all(
        tx.inputs.slice(1).map(async (_i, ix) => await this.prover.signInput(tx, ix))
      )
      const outputs = tx.outputs.map((c, i) => {
        const boxId = computeBoxId(c, tx.id, i)
        return {boxId, transactionId: tx.id, index: i, ...c}
      })
      return {...tx, inputs: [refundInput, ...signedInputs], outputs, size: 0}
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
