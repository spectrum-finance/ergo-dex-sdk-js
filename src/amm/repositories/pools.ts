import {ErgoNetwork, Paging, TokenId} from "ergo-sdk"
import * as N2T from "../contracts/n2tPoolContracts"
import {PoolContracts} from "../contracts/poolContracts"
import * as T2T from "../contracts/t2tPoolContracts"
import {PoolId} from "../types"
import {AmmPool} from "../entities/ammPool"
import {AmmPoolsParser, N2TAmmPoolsParser, T2TAmmPoolsParser} from "../parsers/ammPoolsParser"

export interface Pools {
  /** Get a pool by the given pool `id`.
   */
  get(id: PoolId): Promise<AmmPool | undefined>

  /** Get all pools from the network.
   */
  getAll(paging: Paging): Promise<[AmmPool[], number]>

  /** Get pools containing all of given tokens from the network.
   */
  getByTokens(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]>

  /** Get pools containing any of the given tokens from the network.
   */
  getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]>
}

export function makeNativePools(network: ErgoNetwork): NetworkPools {
  return new NetworkPools(network, new N2TAmmPoolsParser(), N2T.poolBundle())
}

export function makePools(network: ErgoNetwork): NetworkPools {
  return new NetworkPools(network, new T2TAmmPoolsParser(), T2T.poolBundle())
}

export class NetworkPools implements Pools {
  constructor(
    readonly network: ErgoNetwork,
    readonly parser: AmmPoolsParser,
    readonly contracts: PoolContracts
  ) {
  }

  async get(id: PoolId): Promise<AmmPool | undefined> {
    const boxes = await this.network.getUnspentByTokenId(id, {offset: 0, limit: 1})
    if (boxes.length > 0) {
      const poolBox = boxes[0]
      return this.parser.parsePool(poolBox)
    }
    return undefined
  }

  async getAll(paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUnspentByErgoTree(this.contracts.poolTree, paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokens(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: this.contracts.poolTemplateHash, assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxes(req, paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: this.contracts.poolTemplateHash, assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxesByTokensUnion(req, paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
}
