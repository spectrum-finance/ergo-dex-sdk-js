import {Address, AssetAmount} from "../../ergo"
import {AmmDexOperation} from "../models/operations"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AmmOrdersParser, DefaultAmmOrdersParser} from "../parsers/ammOrdersParser"
import {AugErgoBox, AugErgoTx} from "../../network/models"
import {AmmOrderInfo} from "../models/ammOrderInfo"
import {AmmPoolsInfoParser, DefaultAmmPoolsInfoParser} from "../parsers/ammPoolsInfoParser"

export interface History {
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

export function makeHistory(network: ErgoNetwork): History {
  const ordersParser = new DefaultAmmOrdersParser()
  const poolParser = new DefaultAmmPoolsInfoParser()
  return new NetworkHistory(network, ordersParser, poolParser)
}

export class NetworkHistory implements History {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly ordersParser: AmmOrdersParser,
    public readonly poolsParser: AmmPoolsInfoParser
  ) {}

  async getAllByAddress(address: Address, displayLatest: number): Promise<AmmDexOperation[]> {
    const ops: AmmDexOperation[] = []
    let offset = 0
    let uOffset = 0
    const limit = 100
    while (ops.length < displayLatest) {
      const [txs, total] = await this.network.getTxsByAddress(address, {offset, limit: 100})
      const [uTxs, uTotal] = await this.network.getUTxsByAddress(address, {offset: uOffset, limit: 100})
      const allTxs = txs.map(tx => [tx, true]).concat(uTxs.map(tx => [tx, false])) as [AugErgoTx, boolean][]
      for (const [tx, confirmed] of allTxs) {
        const op = this.parseOp(tx, confirmed, [address])
        if (op) ops.push(op)
      }
      if (offset < total) offset += limit
      else if (uOffset < uTotal) uOffset += limit
      else break
    }
    return ops
  }

  async getAllByAddresses(addresses: Address[], limitLatest: number): Promise<AmmDexOperation[]> {
    const ops: AmmDexOperation[] = []
    for (const addr of addresses) {
      let offset = 0
      let uOffset = 0
      const limit = 100
      while (ops.length < limitLatest) {
        const [txs, total] = await this.network.getTxsByAddress(addr, {offset, limit})
        const [uTxs, uTotal] = await this.network.getUTxsByAddress(addr, {offset: uOffset, limit: 100})
        const allTxs = txs.map(tx => [tx, true]).concat(uTxs.map(tx => [tx, false])) as [AugErgoTx, boolean][]
        for (const [tx, confirmed] of allTxs) {
          const op = this.parseOp(tx, confirmed, addresses)
          if (op) ops.push(op)
        }
        if (offset < total) offset += limit
        else if (uOffset < uTotal) uOffset += limit
        else break
      }
      if (ops.length >= limitLatest) break
    }
    return ops
  }

  private parseOp(tx: AugErgoTx, confirmed: boolean, addresses: Address[]): AmmDexOperation | undefined {
    const outputOrder = tx.outputs
      .map(o => {
        const op = this.ordersParser.parse(o)
        return op ? ([op, o] as [AmmOrderInfo, AugErgoBox]) : undefined
      })
      .find(x => x)
    if (outputOrder) {
      const [summary, output] = outputOrder
      if (!output.spentTransactionId)
        return {
          type: "order",
          txId: tx.id,
          boxId: output.boxId,
          status: confirmed ? "submitted" : "pending",
          order: summary
        }
    }

    const inputOrder = tx.inputs
      .map(o => {
        const op = this.ordersParser.parse(o)
        return op ? ([op, o] as [AmmOrderInfo, AugErgoBox]) : undefined
      })
      .find(x => x)

    const poolOutput = () => tx.outputs.map(o => this.poolsParser.parse(o)).find(x => x)

    if (inputOrder) {
      const [summary, input] = inputOrder
      const pool = poolOutput()
      if (pool) {
        return {
          type: "order",
          txId: tx.id,
          boxId: input.boxId,
          status: "executed",
          order: summary
        }
      } else {
        return {
          type: "refund",
          txId: tx.id,
          status: "executed",
          operation: summary.type
        }
      }
    }

    const pool = poolOutput()
    if (pool) {
      const rewardLP = tx.outputs
        .filter(o => addresses.includes(o.address))
        .flatMap(o => o.assets)
        .find(a => a.tokenId === pool.lp.asset.id)
      if (rewardLP)
        return {
          type: "setup",
          txId: tx.id,
          status: "executed",
          pool: pool,
          reward: AssetAmount.fromToken(rewardLP)
        }
    }

    return undefined
  }
}
