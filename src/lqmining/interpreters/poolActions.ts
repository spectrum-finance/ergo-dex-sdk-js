import {
  Address,
  BoxSelection,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  ErgoTx,
  InputSelector, Prover, TxAssembler
} from "@ergolabs/ergo-sdk"
import {prepend} from "ramda"
import {notImplemented} from "../../utils/notImplemented"
import * as validators from "../contracts/proxyValidators"
import {ActionContext} from "../models/actionContext"
import {LqDepositConf, LqRedeemConf, PoolSetupConf} from "../models/poolOpParams"

export interface PoolActions {
  setup(conf: PoolSetupConf, ctx: ActionContext): Promise<ErgoTx[]>;

  deposit(conf: LqDepositConf, ctx: ActionContext): Promise<ErgoTx>;

  redeem(conf: LqRedeemConf, ctx: ActionContext): Promise<ErgoTx>;
}

export function mkPoolActions(
  selector: InputSelector,
  prover: Prover,
  txAsm: TxAssembler,
  uiRewardAddress: Address
): PoolActions {
  return new LmPoolActions(selector, prover, txAsm, uiRewardAddress)
}

class LmPoolActions implements PoolActions {
  constructor(
    public readonly selector: InputSelector,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler,
    public readonly uiRewardAddress: Address
  ) {
  }

  setup(conf: PoolSetupConf, ctx: ActionContext): Promise<ErgoTx[]> {
    notImplemented([conf, ctx])
  }

  deposit(conf: LqDepositConf, ctx: ActionContext): Promise<ErgoTx> {
    const orderValidator = validators
      .deposit(conf.poolId, conf.redeemerPk, conf.fullEpochsRemain)
    const depositInput = conf.depositAmount.toToken()
    const orderOut: ErgoBoxCandidate = {
      value: ctx.minBoxValue,
      ergoTree: orderValidator,
      creationHeight: ctx.network.height,
      assets: [depositInput],
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, ctx.uiFee)
    const inputs = this.selector.select({nErgs: ctx.minBoxValue + ctx.uiFee, assets: [depositInput]})
    if (inputs instanceof BoxSelection) {
      const txr = {
        inputs: inputs,
        dataInputs: [],
        outputs: prepend(orderOut, uiRewardOut),
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.minerFee
      }
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(inputs)
    }
  }

  redeem(conf: LqRedeemConf, ctx: ActionContext): Promise<ErgoTx> {
    const orderValidator = validators
      .redeem(conf.redeemerPk, conf.expectedLqAmount.asset.id, conf.expectedLqAmount.amount)
    const redeemerKey = conf.redeemerKey.toToken()
    const orderOut: ErgoBoxCandidate = {
      value: ctx.minBoxValue,
      ergoTree: orderValidator,
      creationHeight: ctx.network.height,
      assets: [redeemerKey],
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, ctx.uiFee)
    const inputs = this.selector.select({nErgs: ctx.minBoxValue + ctx.uiFee, assets: [redeemerKey]})
    if (inputs instanceof BoxSelection) {
      const txr = {
        inputs: inputs,
        dataInputs: [],
        outputs: prepend(orderOut, uiRewardOut),
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.minerFee
      }
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(inputs)
    }
  }

  private mkUiReward(height: number, uiFee: bigint): ErgoBoxCandidate[] {
    return uiFee > 0
      ? [
        {
          value: uiFee,
          ergoTree: ergoTreeFromAddress(this.uiRewardAddress),
          creationHeight: height,
          assets: [],
          additionalRegisters: EmptyRegisters
        }
      ]
      : []
  }
}
