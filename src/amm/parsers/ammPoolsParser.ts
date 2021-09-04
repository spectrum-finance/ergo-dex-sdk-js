import {AssetAmount, ErgoBox, Int32Constant} from "../../ergo"
import {AmmPool} from "../entities/ammPool"
import {RegisterId} from "../../ergo/entities/registers"
import {deserializeConstant} from "../../ergo/entities/constant"

export interface AmmPoolsParser {
  parsePool(box: ErgoBox): AmmPool | undefined

  parseValidPools(boxes: ErgoBox[]): AmmPool[]
}

export class T2TAmmPoolsParser implements AmmPoolsParser {
  parsePool(box: ErgoBox): AmmPool | undefined {
    const r4 = box.additionalRegisters[RegisterId.R4]
    if (box.assets.length == 4 && r4) {
      const nft = box.assets[0].tokenId
      const lp = AssetAmount.fromToken(box.assets[1])
      const assetX = AssetAmount.fromToken(box.assets[2])
      const assetY = AssetAmount.fromToken(box.assets[3])
      const feeNum = deserializeConstant(r4)
      if (feeNum instanceof Int32Constant) return new AmmPool(nft, lp, assetX, assetY, feeNum.value)
    }
    return undefined
  }

  parseValidPools(boxes: ErgoBox[]): AmmPool[] {
    let pools = []
    for (let box of boxes) {
      const pool = this.parsePool(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}

export class N2TAmmPoolsParser implements AmmPoolsParser {
  parsePool(box: ErgoBox): AmmPool | undefined {
    const r4 = box.additionalRegisters[RegisterId.R4]
    if (box.assets.length == 3 && r4) {
      const nft = box.assets[0].tokenId
      const lp = AssetAmount.fromToken(box.assets[1])
      const assetX = AssetAmount.native(box.value)
      const assetY = AssetAmount.fromToken(box.assets[2])
      const feeNum = deserializeConstant(r4)
      if (feeNum instanceof Int32Constant) return new AmmPool(nft, lp, assetX, assetY, feeNum.value)
    }
    return undefined
  }

  parseValidPools(boxes: ErgoBox[]): AmmPool[] {
    let pools = []
    for (let box of boxes) {
      const pool = this.parsePool(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
