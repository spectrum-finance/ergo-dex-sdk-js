import {AmmPool} from "../entities/ammPool"
import {PoolSetupParams} from "../models/poolSetupParams"
import {SwapParams} from "../models/swapParams"
import {TransactionContext, ErgoTx, Prover, TxAssembler, isNative} from "../../ergo"
import {DepositParams} from "../models/depositParams"
import {RedeemParams} from "../models/redeemParams"
import {N2tPoolOps} from "./n2tPoolOps"
import {T2tPoolOps} from "./t2tPoolOps"

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

export type PoolActionsSelector = (pool: AmmPool) => PoolActions

export function makeDefaultPoolActionsSelector(prover: Prover, txAsm: TxAssembler): PoolActionsSelector {
  const n2t = new N2tPoolOps(prover, txAsm)
  const t2t = new T2tPoolOps(prover, txAsm)
  return pool => (isNative(pool.x.asset) ? n2t : t2t)
}
