import {
  BoxSelection,
  EmptyRegisters,
  ErgoNetwork,
  ergoTreeFromAddress,
  ErgoTx,
  MinTransactionContext,
  Prover,
  treeTemplateFromErgoTree,
  TxAssembler,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {RefundParams} from "../../models/refundParams"
import * as T2T from "../contracts/t2tTemplates"
import * as N2T from "../contracts/n2tTemplates"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams, ctx: MinTransactionContext): Promise<ErgoTx>
}

const RefundableTemplates = [
  T2T.DepositTemplate,
  T2T.RedeemTemplate,
  T2T.SwapTemplate,
  N2T.DepositTemplate,
  N2T.RedeemTemplate,
  N2T.SwapSellTemplate,
  N2T.SwapBuyTemplate
]

export class AmmOrderRefunds implements Refunds {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async refund(params: RefundParams, ctx: MinTransactionContext): Promise<ErgoTx> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find(o => {
      const template = treeTemplateFromErgoTree(o.ergoTree)
      return RefundableTemplates.includes(template)
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
