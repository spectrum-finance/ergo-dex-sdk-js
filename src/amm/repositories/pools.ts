import {PoolId} from "../types"
import {AmmPool} from "../entities/ammPool"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {TokenId} from "../../ergo"
import {T2tPoolContracts} from "../contracts/t2tPoolContracts"
import {Paging} from "../../network/paging"
import {AmmPoolsParser} from "../parsers/ammPoolsParser"

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

export class NetworkPools implements Pools {
  constructor(readonly network: ErgoNetwork, readonly parser: AmmPoolsParser) {}

  async get(id: PoolId): Promise<AmmPool | undefined> {
    let boxes = await this.network.getUnspentByTokenId(id, {offset: 0, limit: 1})
    console.log(boxes)
    if (boxes.length > 0) {
      let poolBox = boxes[0]
      return this.parser.parsePool(poolBox)
    }
    return undefined
  }

  async getAll(paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUnspentByErgoTree(T2tPoolContracts.pool(), paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokens(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: T2tPoolContracts.poolTemplateHash(), assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxes(req, paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: T2tPoolContracts.poolTemplateHash(), assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxesByTokensUnion(req, paging)
    const pools = this.parser.parseValidPools(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
}
