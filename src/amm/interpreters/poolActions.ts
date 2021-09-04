import {ErgoTx, isNative, Prover, TransactionContext, TxAssembler} from "@ergolabs/ergo-sdk"
import {AmmPool} from "../entities/ammPool"
import {PoolSetupParams} from "../models/poolSetupParams"
import {SwapParams} from "../models/swapParams"
import {DepositParams} from "../models/depositParams"
import {RedeemParams} from "../models/redeemParams"
import {N2tPoolActions} from "./n2tPoolActions"
import {T2tPoolActions} from "./t2tPoolActions"

export interface PoolActions {
  /** Interpret `setup` operation on a pool to a chain of transactions.
   */
  setup(params: PoolSetupParams, ctx: TransactionContext): Promise<ErgoTx[]>

  /** Interpret `deposit` operation on a pool to a transaction.
   */
  deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx>

  /** Interpret `redeem` operation on a pool to a transaction.
   */
  redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx>

  /** Interpret `swap` operation on a pool to a transaction.
   */
  swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx>
}

export type PoolActionsSelector = (pool: AmmPool | PoolSetupParams) => PoolActions

export function makeDefaultPoolActionsSelector(prover: Prover, txAsm: TxAssembler): PoolActionsSelector {
  const n2t = new N2tPoolActions(prover, txAsm)
  const t2t = new T2tPoolActions(prover, txAsm)
  return pool => (isNative(pool.x.asset) || isNative(pool.y.asset) ? n2t : t2t)
}
