import {
  Address,
  BoxSelection,
  EmptyRegisters,
  ErgoBoxCandidate,
  ergoTreeFromAddress,
  ErgoTx,
  InputSelector,
  Prover,
  TxAssembler,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {prepend} from "ramda"
import {notImplemented} from "../../utils/notImplemented"
import * as validators from "../contracts/proxyValidators"
import {ActionContext} from "../models/actionContext"
import {LqDepositConf, LqRedeemConf, PoolSetupConf} from "../models/poolOpParams"

/** LM Pool actions
 */
export interface PoolActions<Tx> {
  /** Setup new LM program (LM pool).
   */
  setup(conf: PoolSetupConf, ctx: ActionContext): Promise<Tx[]>

  /** Deposit liquidity (LP tokens) to LM pool.
   */
  deposit(conf: LqDepositConf, ctx: ActionContext): Promise<Tx>

  /** Redeem liquidity (LP tokens) from LM pool.
   */
  redeem(conf: LqRedeemConf, ctx: ActionContext): Promise<Tx>
}

export function mkPoolActions(selector: InputSelector, uiRewardAddress: Address): PoolActions<TxRequest> {
  return new LmPoolActions(selector, uiRewardAddress)
}

export function mkWrappedPoolActions(
  selector: InputSelector,
  prover: Prover,
  txAsm: TxAssembler,
  uiRewardAddress: Address
): PoolActions<ErgoTx> {
  return wrapPoolActions(mkPoolActions(selector, uiRewardAddress), prover, txAsm)
}

export function wrapPoolActions(
  actions: PoolActions<TxRequest>,
  prover: Prover,
  txAsm: TxAssembler
): PoolActions<ErgoTx> {
  return new PoolActionsWrapper(actions, prover, txAsm)
}

class LmPoolActions implements PoolActions<TxRequest> {
  constructor(public readonly selector: InputSelector, public readonly uiRewardAddress: Address) {}

  setup(conf: PoolSetupConf, ctx: ActionContext): Promise<TxRequest[]> {
    notImplemented([conf, ctx])
  }

  async deposit(conf: LqDepositConf, ctx: ActionContext): Promise<TxRequest> {
    const orderValidator = validators.deposit(conf.poolId, conf.redeemerPk, conf.fullEpochsRemain)
    const depositInput = conf.depositAmount.toToken()
    const orderOut: ErgoBoxCandidate = {
      value: ctx.minBoxValue,
      ergoTree: orderValidator,
      creationHeight: ctx.network.height,
      assets: [depositInput],
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, ctx.uiFee)
    const inputs = await this.selector.select({
      nErgs: ctx.minBoxValue + ctx.minBoxValue + conf.executionFee + ctx.uiFee + ctx.minerFee,
      assets: [depositInput]
    })
    if (inputs instanceof BoxSelection) {
      return {
        inputs: inputs,
        dataInputs: [],
        outputs: prepend(orderOut, uiRewardOut),
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.minerFee
      }
    } else {
      return Promise.reject(inputs)
    }
  }

  async redeem(conf: LqRedeemConf, ctx: ActionContext): Promise<TxRequest> {
    const orderValidator = validators.redeem(
      conf.redeemerPk,
      conf.expectedLqAmount.asset.id,
      conf.expectedLqAmount.amount
    )
    const redeemerKey = conf.redeemerKey.toToken()
    const orderOut: ErgoBoxCandidate = {
      value: ctx.minBoxValue,
      ergoTree: orderValidator,
      creationHeight: ctx.network.height,
      assets: [redeemerKey],
      additionalRegisters: EmptyRegisters
    }
    const uiRewardOut: ErgoBoxCandidate[] = this.mkUiReward(ctx.network.height, ctx.uiFee)
    const inputs = await this.selector.select({
      nErgs: ctx.minBoxValue + conf.executionFee + ctx.uiFee + ctx.minerFee,
      assets: [redeemerKey]
    })
    if (inputs instanceof BoxSelection) {
      return {
        inputs: inputs,
        dataInputs: [],
        outputs: prepend(orderOut, uiRewardOut),
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.minerFee
      }
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

class PoolActionsWrapper implements PoolActions<ErgoTx> {
  constructor(
    public readonly impl: PoolActions<TxRequest>,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async setup(conf: PoolSetupConf, ctx: ActionContext): Promise<ErgoTx[]> {
    const [txr0, txr1] = await this.impl.setup(conf, ctx)
    const tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))
    const tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))
    return [tx0, tx1]
  }

  async deposit(conf: LqDepositConf, ctx: ActionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.deposit(conf, ctx), ctx.network))
  }

  async redeem(conf: LqRedeemConf, ctx: ActionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.redeem(conf, ctx), ctx.network))
  }
}
