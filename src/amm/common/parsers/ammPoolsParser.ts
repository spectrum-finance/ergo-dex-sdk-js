import {AssetAmount, deserializeConstant, ErgoBox, Int32Constant, RegisterId} from "@ergolabs/ergo-sdk"
import {FromBox} from "../../../fromBox"
import {AmmPool} from "../entities/ammPool"

export class T2TAmmPoolsParser implements FromBox<AmmPool> {
  from(box: ErgoBox): AmmPool | undefined {
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

  fromMany(boxes: ErgoBox[]): AmmPool[] {
    const pools = []
    for (const box of boxes) {
      const pool = this.from(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}

export class N2TAmmPoolsParser implements FromBox<AmmPool> {
  from(box: ErgoBox): AmmPool | undefined {
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

  fromMany(boxes: ErgoBox[]): AmmPool[] {
    const pools = []
    for (const box of boxes) {
      const pool = this.from(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
