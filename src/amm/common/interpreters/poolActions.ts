import {ErgoTx, Prover, TransactionContext, TxAssembler, TxRequest} from "@ergolabs/ergo-sdk"
import {ExFeeType} from "../../../types"
import {AmmPool} from "../entities/ammPool"
import {DepositParams} from "../models/depositParams"
import {PoolSetupParams} from "../models/poolSetupParams"
import {RedeemParams} from "../models/redeemParams"
import {SwapParams} from "../models/swapParams"

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

class PoolActionsWrapper<F extends ExFeeType> implements PoolActions<ErgoTx, F> {
  constructor(
    public readonly impl: PoolActions<TxRequest, F>,
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler
  ) {}

  async setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]> {
    const [txr0, txr1] = await this.impl.setup(params, ctx)
    const tx0 = await this.prover.sign(this.txAsm.assemble(txr0, ctx.network))
    const tx1 = await this.prover.sign(this.txAsm.assemble(txr1, ctx.network))
    return [tx0, tx1]
  }

  async deposit(params: DepositParams<F>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.deposit(params, ctx), ctx.network))
  }

  async redeem(params: RedeemParams<F>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.redeem(params, ctx), ctx.network))
  }

  async swap(params: SwapParams<F>, ctx: TransactionContext): Promise<ErgoTx> {
    return this.prover.sign(this.txAsm.assemble(await this.impl.swap(params, ctx), ctx.network))
  }
}

export type PoolActionsSelector<Tx, F extends ExFeeType> = (
  pool: AmmPool | PoolSetupParams
) => PoolActions<Tx, F>

export function wrapPoolActions<F extends ExFeeType>(
  actions: PoolActions<TxRequest, F>,
  prover: Prover,
  txAsm: TxAssembler
): PoolActions<ErgoTx, F> {
  return new PoolActionsWrapper(actions, prover, txAsm)
}
