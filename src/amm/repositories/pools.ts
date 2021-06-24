import {PoolId} from "../types"
import {AmmPool} from "../entities/ammPool"
import {ErgoNetwork} from "../../services/ergoNetwork"
import {AssetAmount, ErgoBox, Int32Constant} from "../../ergo"
import {RegisterId} from "../../ergo/entities/registers"
import {T2tPoolContracts} from "../contracts/t2tPoolContracts"
import {Paging} from "../../network/paging"
import {deserializeConstant} from "../../ergo/entities/constant"

export interface Pools {
  get(id: PoolId): Promise<AmmPool | undefined>

  getAll(paging: Paging): Promise<[AmmPool[], number]>
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
    let [boxes, totalBoxes] = await this.network.getUnspentByErgoTree(T2tPoolContracts.pool(), paging)
    let pools = []
    for (let box of boxes) {
      let pool = parsePool(box)
      if (pool) pools.push(pool)
    }
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
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
