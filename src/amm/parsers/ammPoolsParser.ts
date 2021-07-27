import {AssetAmount, ErgoBox, Int32Constant} from "../../ergo"
import {AmmPool} from "../entities/ammPool"
import {RegisterId} from "../../ergo/entities/registers"
import {deserializeConstant} from "../../ergo/entities/constant"

export interface AmmPoolsParser {
  parsePool(box: ErgoBox): AmmPool | undefined

  parseValidPools(boxes: ErgoBox[]): AmmPool[]
}

export class DefaultAmmPoolsParser implements AmmPoolsParser {
  parsePool(box: ErgoBox): AmmPool | undefined {
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

  parseValidPools(boxes: ErgoBox[]): AmmPool[] {
    let pools = []
    for (let box of boxes) {
      let pool = this.parsePool(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
