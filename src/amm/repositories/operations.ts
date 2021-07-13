import {Address, ErgoTx, TxId} from "../../ergo"
import {AmmOperation, Executed, OpStatus, Pending, Submitted} from "../models/ammOperation"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AmmOpsParser} from "../parsers/ammOpsParser"

export interface Operations {
  /** Get operation by txId.
   */
  getByTxId(txId: TxId): Promise<AmmOperation | undefined>

  /** Get operations by a given address.
   *  @address - address to fetch operations by
   *  @displayLatest - number of latest operations to display
   */
  getAllByAddress(address: Address, displayLatest: number): Promise<AmmOperation[]>

  /** Get operations by a given list of addresses.
   *  @address - address to fetch operations by
   *  @displayLatest - number of latest operations to display
   */
  getAllByAddresses(addresses: Address[], displayLatest: number): Promise<AmmOperation[]>
}

export class NetworkOperations implements Operations {
  constructor(public readonly network: ErgoNetwork, public readonly parser: AmmOpsParser) {}

  async getByTxId(txId: TxId): Promise<AmmOperation | undefined> {
    const tx = await this.network.getTx(txId)
    return tx ? this.parseOp(tx) : undefined
  }

  async getAllByAddress(address: Address, displayLatest: number): Promise<AmmOperation[]> {
    let ops: AmmOperation[] = []
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

  async getAllByAddresses(addresses: Address[], displayLatest: number): Promise<AmmOperation[]> {
    let ops: AmmOperation[] = []
    for (const addr of addresses) {
      let offset: number = 0
      const limit = 100
      while (ops.length < displayLatest) {
        const [txs, total] = await this.network.getTxsByAddress(addr, {offset, limit: 100})
        for (const tx of txs) {
          const op = await this.parseOp(tx)
          if (op) ops.push(op)
        }
        if (offset < total) offset += limit
        else break
      }
      if (ops.length >= displayLatest) break
    }
    return ops
  }

  private async parseOp(tx: ErgoTx): Promise<AmmOperation | undefined> {
    const parsedOp = tx ? this.parser.parse(tx) : undefined
    let op: AmmOperation | undefined = undefined
    if (parsedOp) {
      const [summary, boxId] = parsedOp
      const output = await this.network.getOutput(boxId)

      let status: OpStatus
      if (output?.spentTransactionId) status = Executed
      else if (output) status = Submitted
      else status = Pending

      op = {txId: tx.id, boxId, status, summary}
    }
    return op
  }
}
