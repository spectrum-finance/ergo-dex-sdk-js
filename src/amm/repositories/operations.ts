import {Address, ErgoTx, TxId} from "../../ergo"
import {AmmOperation, Executed, OpStatus, Pending, Submitted} from "../models/ammOperation"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AmmOpsParser} from "../parsers/ammOpsParser"

export interface Operations {
  getByTxId(txId: TxId): Promise<AmmOperation | undefined>

  getAllByAddress(address: Address, displayFirst: number): Promise<AmmOperation[]>
}

export class NetworkOperations implements Operations {
  constructor(public readonly network: ErgoNetwork, public readonly parser: AmmOpsParser) {}

  async getByTxId(txId: TxId): Promise<AmmOperation | undefined> {
    const tx = await this.network.getTx(txId)
    return tx ? this.parseOp(tx) : undefined
  }

  async getAllByAddress(address: Address, displayFirst: number): Promise<AmmOperation[]> {
    let ops: AmmOperation[] = []
    let offset: number = 0
    const limit = 100
    while (ops.length < displayFirst) {
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
