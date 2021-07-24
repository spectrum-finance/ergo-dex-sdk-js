import {Address, BoxId, TxId} from "../../ergo"
import {AmmOperation, Executed, OpStatus, Pending, Submitted} from "../models/ammOperation"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AmmOpsParser} from "../parsers/ammOpsParser"
import {RefundOperation} from "../models/refundOperation"
import {OperationSummary} from "../models/operationSummary"
import {AugErgoTx} from "../../network/models"

export type AmmDexOperation = AmmOperation | RefundOperation

export interface Operations {
  /** Get operation by txId.
   */
  getByTxId(txId: TxId): Promise<AmmDexOperation | undefined>

  /** Get operations by a given address.
   *  @address - address to fetch operations by
   *  @displayLatest - number of latest operations to display
   */
  getAllByAddress(address: Address, displayLatest: number): Promise<AmmDexOperation[]>

  /** Get operations by a given list of addresses.
   *  @address - address to fetch operations by
   *  @displayLatest - number of latest operations to display
   */
  getAllByAddresses(addresses: Address[], displayLatest: number): Promise<AmmDexOperation[]>
}

export class NetworkOperations implements Operations {
  constructor(public readonly network: ErgoNetwork, public readonly parser: AmmOpsParser) {}

  async getByTxId(txId: TxId): Promise<AmmDexOperation | undefined> {
    const tx = await this.network.getTx(txId)
    return tx ? this.parseOp(tx) : undefined
  }

  async getAllByAddress(address: Address, displayLatest: number): Promise<AmmDexOperation[]> {
    let ops: AmmDexOperation[] = []
    let offset: number = 0
    const limit = 100
    while (ops.length < displayLatest) {
      const [txs, total] = await this.network.getTxsByAddress(address, {offset, limit: 100})
      for (const tx of txs) {
        const op = await this.parseOp(tx)
        if (op) ops.push(op)
      }
      if (offset < total) offset += limit
      else break
    }
    return ops
  }

  async getAllByAddresses(addresses: Address[], limitLatest: number): Promise<AmmDexOperation[]> {
    let ops: AmmDexOperation[] = []
    for (const addr of addresses) {
      let offset: number = 0
      const limit = 100
      while (ops.length < limitLatest) {
        const [txs, total] = await this.network.getTxsByAddress(addr, {offset, limit})
        for (const tx of txs) {
          const op = await this.parseOp(tx)
          if (op) ops.push(op)
        }
        if (offset < total) offset += limit
        else break
      }
      if (ops.length >= limitLatest) break
    }
    return ops
  }

  private async parseOp(tx: AugErgoTx): Promise<AmmDexOperation | undefined> {
    const parsedOp = tx.outputs
      .map(o => {
        const op = this.parser.parse(o)
        return op ? ([op, o.boxId] as [OperationSummary, BoxId]) : undefined
      })
      .find(x => x)
    let op: AmmDexOperation | undefined = undefined
    if (parsedOp) {
      const [summary, boxId] = parsedOp
      const output = tx.outputs.find(o => o.boxId === boxId)

      let status: OpStatus
      if (output?.spentTransactionId) status = Executed
      else if (output) status = Submitted
      else status = Pending

      op = {tag: "order", txId: tx.id, boxId, status, summary}
    } else {
      const opInput = tx.inputs.map(i => this.parser.parse(i)).find(x => x)
      if (opInput && opInput.type !== "setup") {
        op = {tag: "refund", txId: tx.id, status: "executed", operation: opInput.type}
      }
    }
    return op
  }
}
