import {Address, ErgoNetwork} from "@ergolabs/ergo-sdk"
import {TokenLock} from "../entities"
import {LockParser} from "../parsers/lockParser"

export interface LocksHistory {
  /** Get locks by a given list of addresses.
   *  @address - address to fetch operations by
   */
  getAllByAddresses(addresses: Address[]): Promise<TokenLock[]>
}

export function mkLocksHistory(network: ErgoNetwork, parser: LockParser): LocksHistory {
  return new DefaultLocksHistory(network, parser)
}

class DefaultLocksHistory implements LocksHistory {
  constructor(public readonly network: ErgoNetwork, public readonly parser: LockParser) {}
  async getAllByAddresses(addresses: Address[]): Promise<TokenLock[]> {
    const ops: TokenLock[] = []
    for (const addr of addresses) {
      const limit = 100
      let offset = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const [txs, total] = await this.network.getTxsByAddress(addr, {offset, limit: 100}) // todo: Use direct UTxO search
        for (const out of txs.flatMap(tx => tx.outputs)) {
          const op = this.parser.parseTokenLock(out)
          if (op) ops.push(op)
        }
        if (offset < total) offset += limit
        else break
      }
    }
    return ops
  }
}
