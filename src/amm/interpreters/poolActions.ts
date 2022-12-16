import {
  Address,
  ErgoTx,
  isNative,
  Prover,
  TransactionContext,
  TxAssembler,
  TxRequest
} from "@ergolabs/ergo-sdk"
import {ExFeeType, NativeExFeeType} from "../../types"
import {AmmPool} from "../entities/ammPool"
import {DepositParams} from "../models/depositParams"
import {PoolSetupParams} from "../models/poolSetupParams"
import {RedeemParams} from "../models/redeemParams"
import {SwapParams} from "../models/swapParams"
import {N2tPoolActionsNative} from "./n2tPoolActionsNative"
import {T2tPoolActionsNative} from "./t2tPoolActionsNative"

export interface PoolActions<Tx, F extends ExFeeType> {
  /** Interpret `setup` operation on a pool to a chain of transactions.
   */
  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<Tx[]>

  /** Interpret `deposit` operation on a pool to a transaction.
   */
  deposit(params: DepositParams<F>, ctx: TransactionContext): Promise<Tx>

  /** Interpret `redeem` operation on a pool to a transaction.
   */
  redeem(params: RedeemParams<F>, ctx: TransactionContext): Promise<Tx>

  /** Interpret `swap` operation on a pool to a transaction.
   */
  swap(params: SwapParams<F>, ctx: TransactionContext): Promise<Tx>
}

export type PoolActionsSelector<Tx, F extends ExFeeType> = (
  pool: AmmPool | PoolSetupParams
) => PoolActions<Tx, F>

export function makePoolActionsSelector(
  uiRewardAddress: Address
): PoolActionsSelector<TxRequest, NativeExFeeType> {
  return pool =>
    isNative(pool.x.asset) || isNative(pool.y.asset)
      ? new N2tPoolActionsNative(uiRewardAddress)
      : new T2tPoolActionsNative(uiRewardAddress)
}

export function makeWrappedPoolActionsSelector(
  uiRewardAddress: Address,
  prover: Prover,
  txAsm: TxAssembler
): PoolActionsSelector<ErgoTx, NativeExFeeType> {
  return pool =>
    wrapPoolActions(
      isNative(pool.x.asset) || isNative(pool.y.asset)
        ? new N2tPoolActionsNative(uiRewardAddress)
        : new T2tPoolActionsNative(uiRewardAddress),
      prover,
      txAsm
    )
}

export function wrapPoolActions(
  actions: PoolActions<TxRequest, NativeExFeeType>,
  prover: Prover,
  txAsm: TxAssembler
): PoolActions<ErgoTx, NativeExFeeType> {
  return new PoolActionsWrapper(actions, prover, txAsm)
}

class PoolActionsWrapper implements PoolActions<ErgoTx, NativeExFeeType> {
  constructor(
    public readonly impl: PoolActions<TxRequest, NativeExFeeType>,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
    const [txr0, txr1] = await this.impl.setup(params, ctx)
    const tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))
    const tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))
    return [tx0, tx1]
  }

  async deposit(params: DepositParams<NativeExFeeType>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.deposit(params, ctx), ctx.network))
  }

  async redeem(params: RedeemParams<NativeExFeeType>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.redeem(params, ctx), ctx.network))
  }

  async swap(params: SwapParams<NativeExFeeType>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.swap(params, ctx), ctx.network))
  }
}
