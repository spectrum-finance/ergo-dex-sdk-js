import {
  BoxSelection, DefaultBoxSelector, EmptyRegisters,
  ErgoNetwork, ergoTreeFromAddress,
  ErgoTx, InsufficientInputs,
  MinTransactionContext,
  Prover,
  treeTemplateFromErgoTree,
  TxAssembler,
  TxRequest
} from "@ergolabs/ergo-sdk"
import * as LQ_MINING_CONTRACTS from "../../../lqmining/contracts/proxyValidators";
import {RefundParams} from "../../../models/refundParams"
import * as N2T_NATIVE from "../../nativeFee/contracts/n2tTemplates"
import * as T2T_NATIVE from "../../nativeFee/contracts/t2tTemplates"
import * as N2T_SPF from "../../spfFee/contracts/n2tTemplates"
import * as T2T_SPF from "../../spfFee/contracts/t2tTemplates"

export interface Refunds<Tx> {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams, ctx: MinTransactionContext): Promise<Tx>
}

const RefundableTemplates = [
  T2T_NATIVE.DepositTemplate,
  T2T_NATIVE.RedeemTemplate,
  T2T_NATIVE.SwapTemplate,
  N2T_NATIVE.DepositTemplate,
  N2T_NATIVE.RedeemTemplate,
  N2T_NATIVE.SwapSellTemplate,
  N2T_NATIVE.SwapBuyTemplate,

  T2T_SPF.DepositTemplate,
  T2T_SPF.RedeemTemplate,
  T2T_SPF.SwapTemplate,
  N2T_SPF.DepositTemplate,
  N2T_SPF.RedeemTemplate,
  N2T_SPF.SwapSellTemplate,
  N2T_SPF.SwapBuyTemplate,

  LQ_MINING_CONTRACTS.depositTemplate,
  LQ_MINING_CONTRACTS.redeemTemplate
]

export class AmmOrderRefunds implements Refunds<TxRequest> {
  constructor(public readonly network: ErgoNetwork) {}

  async refund(params: RefundParams, ctx: MinTransactionContext): Promise<TxRequest> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find(o => {
      const template = treeTemplateFromErgoTree(o.ergoTree)
      return RefundableTemplates.includes(template)
    })
    if (!outputToRefund) {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`);
    }
    let outputNErg: bigint;
    let inputs: BoxSelection;

    if (outputToRefund.value - ctx.feeNErgs >= 0) {
      outputNErg = outputToRefund.value - ctx.feeNErgs;
      inputs = BoxSelection.safe(outputToRefund)
    } else {
      if (!params.utxos?.length) {
        return Promise.reject('Insufficient Inputs for refund')
      }
      outputNErg = outputToRefund.value;
      const userInputs = DefaultBoxSelector.select(params.utxos, { assets: [], nErgs: ctx.feeNErgs });
      if (userInputs instanceof InsufficientInputs) {
        return Promise.reject('Insufficient Inputs for refund')
      }
      inputs = BoxSelection.safe(outputToRefund, userInputs.inputs, userInputs.change);
    }

    const refundOut = {
      value: outputNErg,
      ergoTree: ergoTreeFromAddress(params.recipientAddress),
      creationHeight: ctx.network.height,
      assets: outputToRefund.assets,
      additionalRegisters: EmptyRegisters
    }

    return Promise.resolve({
      inputs: inputs,
      dataInputs: [],
      outputs: [refundOut],
      changeAddress: params.recipientAddress,
      feeNErgs: ctx.feeNErgs
    })
  }
}

export class AmmOrderRefundsWrapper implements Refunds<ErgoTx> {
  constructor(
    public readonly refunds: Refunds<TxRequest>,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async refund(params: RefundParams, ctx: MinTransactionContext): Promise<ErgoTx> {
    return this.refunds
      .refund(params, ctx)
      .then(txRequest => this.prover.sign(this.txAsm.assemble(txRequest, ctx.network)))
  }
}
