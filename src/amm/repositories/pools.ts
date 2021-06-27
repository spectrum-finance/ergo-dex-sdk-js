import {PoolId} from "../types"
import {AmmPool} from "../entities/ammPool"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AssetAmount, ErgoBox, Int32Constant, TokenId} from "../../ergo"
import {RegisterId} from "../../ergo/entities/registers"
import {T2tPoolContracts} from "../contracts/t2tPoolContracts"
import {Paging} from "../../network/paging"
import {deserializeConstant} from "../../ergo/entities/constant"

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
  constructor(readonly network: ErgoNetwork) {}

  async get(id: PoolId): Promise<AmmPool | undefined> {
    let boxes = await this.network.getUnspentByTokenId(id, {offset: 0, limit: 1})
    if (boxes.length > 0) {
      let poolBox = boxes[0]
      return parsePool(poolBox)
    }
    return undefined
  }

  async getAll(paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUnspentByErgoTree(T2tPoolContracts.pool(), paging)
    const pools = filterValidPool(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokens(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: T2tPoolContracts.poolTemplateHash(), assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxes(req, paging)
    const pools = filterValidPool(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[AmmPool[], number]> {
    const req = {ergoTreeTemplateHash: T2tPoolContracts.poolTemplateHash(), assets: tokens}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxesByTokensUnion(req, paging)
    const pools = filterValidPool(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
}

function filterValidPool(boxes: ErgoBox[]): AmmPool[] {
  let pools = []
  for (let box of boxes) {
    let pool = parsePool(box)
    if (pool) pools.push(pool)
  }
  return pools
}

function parsePool(box: ErgoBox): AmmPool | undefined {
  let nft = box.assets[0].tokenId
  let lp = AssetAmount.fromToken(box.assets[1])
  let assetX = AssetAmount.fromToken(box.assets[2])
  let assetY = AssetAmount.fromToken(box.assets[3])
  let r4 = box.additionalRegisters[RegisterId.R4]
  if (r4) {
    let feeNum = deserializeConstant(r4)
    if (feeNum instanceof Int32Constant) return new AmmPool(nft, lp, assetX, assetY, feeNum.value)
  }
  return undefined
}
