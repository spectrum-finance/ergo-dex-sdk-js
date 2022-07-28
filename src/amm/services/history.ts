import {Address, AssetAmount, AugErgoBox, AugErgoTx, ErgoNetwork} from "@ergolabs/ergo-sdk"
import {AmmOrderInfo} from "../models/ammOrderInfo"
import {AmmDexOperation} from "../models/operations"
import {AmmOrdersParser, DefaultAmmOrdersParser} from "../parsers/ammOrdersParser"
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
    let uOffset = 0
    const limit = 100
    while (ops.length < displayLatest) {
      const [txs, total] = await this.network.getUTxsByAddress(address, {offset: uOffset, limit: 100})
      for (const tx of txs) {
        const op = this.parseOp(tx, false, [address])
        if (op) ops.push(op)
      }
      if (uOffset < total) uOffset += limit
      else break
    }
    let offset = 0
    while (ops.length < displayLatest) {
      const [txs, total] = await this.network.getTxsByAddress(address, {offset, limit: 100})
      for (const tx of txs) {
        const op = this.parseOp(tx, true, [address])
        if (op) ops.push(op)
      }
      if (offset < total) offset += limit
      else break
    }
    return ops
  }

  async getAllByAddresses(addresses: Address[], displayLatest: number): Promise<AmmDexOperation[]> {
    const ops: AmmDexOperation[] = []
    for (const addr of addresses) {
      let uOffset = 0
      const limit = 100
      while (ops.length < displayLatest) {
        const [txs, total] = await this.network.getUTxsByAddress(addr, {offset: uOffset, limit: 100})
        for (const tx of txs) {
          const op = this.parseOp(tx, false, addresses)
          if (op) ops.push(op)
        }
        if (uOffset < total) uOffset += limit
        else break
      }
      let offset = 0
      while (ops.length < displayLatest) {
        const [txs, total] = await this.network.getTxsByAddress(addr, {offset, limit: 100})
        for (const tx of txs) {
          const op = this.parseOp(tx, true, addresses)
          if (op) ops.push(op)
        }
        if (offset < total) offset += limit
        else break
      }
    }
    return ops
  }

  private parseOp(tx: AugErgoTx, confirmed: boolean, addresses: Address[]): AmmDexOperation | undefined {
    const outputOrder = tx.outputs
      .map(o => {
        const op = this.ordersParser.parse(o)
        return op ? ([op, o] as [AmmOrderInfo, AugErgoBox]) : undefined
      })
      .find(x => !!x);

    if (outputOrder) {
      const [summary, output] = outputOrder
      if (!output.spentTransactionId)
        return {
          type: "order",
          timestamp: tx.timestamp,
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
      .find(x => !!x)

    const poolOutput = () => tx.outputs.map(o => this.poolsParser.parse(o)).find(x => !!x)

    if (inputOrder && !confirmed) {
      const [summary, input] = inputOrder
      return {
        type: 'order',
        timestamp: (tx as any).creationTimestamp,
        txId: tx.id,
        boxId: input.boxId,
        orderInput: input,
        status: 'inProgress',
        order: summary
      }
    }
    if (inputOrder && confirmed) {
      const [summary, input] = inputOrder
      const pool = poolOutput()
      if (pool) {
        return {
          type: "order",
          timestamp: tx.timestamp,
          txId: tx.id,
          boxId: input.boxId,
          status: "executed",
          order: summary
        }
      } else {
        return {
          type: "refund",
          timestamp: tx.timestamp,
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
          timestamp: tx.timestamp,
          txId: tx.id,
          status: "executed",
          pool: pool,
          reward: AssetAmount.fromToken(rewardLP)
        }
    }

    return undefined
  }
}
