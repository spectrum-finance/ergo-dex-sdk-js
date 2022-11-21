import {ErgoNetwork, Paging, TokenId} from "@ergolabs/ergo-sdk"
import {FromBox} from "../fromBox"
import {PoolContracts} from "../contracts/poolContracts"
import {PoolId} from "../lqmining/types"

export interface Pools<TPool> {
  /** Get a pool by the given pool `id`.
   */
  get(poolId: PoolId): Promise<TPool | undefined>

  /** Get all pools from the network.
   */
  getAll(paging: Paging): Promise<[TPool[], number]>

  /** Get pools containing all of given tokens from the network.
   */
  getByTokens(tokens: TokenId[], paging: Paging): Promise<[TPool[], number]>

  /** Get pools containing any of the given tokens from the network.
   */
  getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[TPool[], number]>
}

export function makePools<TPool>(
  network: ErgoNetwork,
  parser: FromBox<TPool>,
  contracts: PoolContracts<TPool>
): Pools<TPool> {
  return new NetworkPools(network, parser, contracts)
}

class NetworkPools<TPool> implements Pools<TPool> {
  constructor(
    readonly network: ErgoNetwork,
    readonly parser: FromBox<TPool>,
    readonly contracts: PoolContracts<TPool>
  ) {}

  async get(poolId: PoolId): Promise<TPool | undefined> {
    const boxes = await this.network.getUnspentByTokenId(poolId, {offset: 0, limit: 1})
    if (boxes.length > 0) {
      const poolBox = boxes[0]
      return this.parser.from(poolBox)
    }
    return undefined
  }

  async getAll(paging: Paging): Promise<[TPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUnspentByErgoTree(this.contracts.poolTree, paging)
    const pools = this.parser.fromMany(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokens(tokens: TokenId[], paging: Paging): Promise<[TPool[], number]> {
    const req = {ergoTreeTemplateHash: this.contracts.poolTemplateHash, assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxes(req, paging)
    const pools = this.parser.fromMany(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[TPool[], number]> {
    const req = {ergoTreeTemplateHash: this.contracts.poolTemplateHash, assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxesByTokensUnion(req, paging)
    const pools = this.parser.fromMany(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
}
