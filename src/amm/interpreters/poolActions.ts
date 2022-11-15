import {
  Address,
  ErgoTx,
  isNative,
  Prover,
  TransactionContext,
  TxAssembler,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {AmmPool} from "../entities/ammPool"
import {DepositParams} from "../models/depositParams"
import {PoolSetupParams} from "../models/poolSetupParams"
import {RedeemParams} from "../models/redeemParams"
import {SwapParams} from "../models/swapParams"
import {N2tPoolActions} from "./n2tPoolActions"
import {T2tPoolActions} from "./t2tPoolActions"

export interface PoolActions<Tx> {
  /** Interpret `setup` operation on a pool to a chain of transactions.
   */
  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<Tx[]>

  /** Interpret `deposit` operation on a pool to a transaction.
   */
  deposit(params: DepositParams, ctx: TransactionContext): Promise<Tx>

  /** Interpret `redeem` operation on a pool to a transaction.
   */
  redeem(params: RedeemParams, ctx: TransactionContext): Promise<Tx>

  /** Interpret `swap` operation on a pool to a transaction.
   */
  swap(params: SwapParams, ctx: TransactionContext): Promise<Tx>
}

export type PoolActionsSelector<Tx> = (pool: AmmPool | PoolSetupParams) => PoolActions<Tx>

export function makePoolActionsSelector(uiRewardAddress: Address): PoolActionsSelector<TxRequest> {
  return pool =>
    isNative(pool.x.asset) || isNative(pool.y.asset)
      ? new N2tPoolActions(uiRewardAddress)
      : new T2tPoolActions(uiRewardAddress)
}

export function makeWrappedPoolActionsSelector(
  uiRewardAddress: Address,
  prover: Prover,
  txAsm: TxAssembler
): PoolActionsSelector<ErgoTx> {
  return pool =>
    wrapPoolActions(
      isNative(pool.x.asset) || isNative(pool.y.asset)
        ? new N2tPoolActions(uiRewardAddress)
        : new T2tPoolActions(uiRewardAddress),
      prover,
      txAsm
    )
}

function wrapPoolActions(
  actions: PoolActions<TxRequest>,
  prover: Prover,
  txAsm: TxAssembler
): PoolActions<ErgoTx> {
  return new PoolActionsWrapper(actions, prover, txAsm)
}

class PoolActionsWrapper implements PoolActions<ErgoTx> {
  constructor(
    public readonly impl: PoolActions<TxRequest>,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
    const [txr0, txr1] = await this.impl.setup(params, ctx)
    const tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))
    const tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))
    return [tx0, tx1]
  }

  async deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.deposit(params, ctx), ctx.network))
  }

  async redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.redeem(params, ctx), ctx.network))
  }

  async swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.swap(params, ctx), ctx.network))
  }
}
