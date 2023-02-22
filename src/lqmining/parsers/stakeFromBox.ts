import {AssetAmount, deserializeConstant, ErgoBox, RegisterId, toHex} from "@ergolabs/ergo-sdk"
import {ByteaConstant} from "@ergolabs/ergo-sdk/build/main/entities/constant"
import {FromBox} from "../../fromBox"
import {Stake} from "../models/stake"

export class StakeFromBox implements FromBox<Stake> {
  from(box: ErgoBox): Stake | undefined {
    const r5 = box.additionalRegisters[RegisterId.R5]
    if (box.assets.length == 3 && r5) {
      const poolId = deserializeConstant(r5)
      if (poolId instanceof ByteaConstant) {
        return {
          poolId: toHex(poolId.value),
          lockedLq: AssetAmount.fromToken(box.assets[0]),
          bundleKeyAsset: AssetAmount.fromToken(box.assets[2])
        }
      }
    }
    return undefined
  }

  fromMany(boxes: ErgoBox[]): Stake[] {
    const stakes = []
    for (const box of boxes) {
      const stake = this.from(box)
      if (stake) stakes.push(stake)
    }
    return stakes
  }
}
