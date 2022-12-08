import {AssetAmount, deserializeConstant, ErgoBox, Int64Constant, RegisterId} from "@ergolabs/ergo-sdk"
import {Int32ArrayConstant} from "@ergolabs/ergo-sdk/build/main/entities/constant"
import {FromBox} from "../../fromBox"
import {LmPool} from "../entities/lmPool"

export class LmPoolFromBox implements FromBox<LmPool> {
  from(box: ErgoBox): LmPool | undefined {
    const r4 = box.additionalRegisters[RegisterId.R4]
    const r5 = box.additionalRegisters[RegisterId.R5]
    if (box.assets.length === 5 && r4 && r5) {
      const nft = box.assets[0].tokenId
      const rew = AssetAmount.fromToken(box.assets[1])
      const lq = AssetAmount.fromToken(box.assets[2])
      const vlq = AssetAmount.fromToken(box.assets[3])
      const tmp = AssetAmount.fromToken(box.assets[4])
      const settings = deserializeConstant(r4)
      const budget = deserializeConstant(r5)
      if (settings instanceof Int32ArrayConstant && budget instanceof Int64Constant) {
        const conf = {
          epochLen: settings.value[0],
          epochNum: settings.value[1],
          programStart: settings.value[2],
          programBudget: budget.value
        }
        return new LmPool(nft, conf, rew, lq, vlq, tmp)
      }
    }
    return undefined
  }

  fromMany(boxes: ErgoBox[]): LmPool[] {
    const pools = []
    for (const box of boxes) {
      const pool = this.from(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
