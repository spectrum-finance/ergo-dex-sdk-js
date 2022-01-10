import {
  AssetAmount,
  deserializeConstant,
  ErgoBox,
  Int32Constant,
  RegisterId,
  SigmaPropConstant
} from "@ergolabs/ergo-sdk"
import {TokenLock} from "../entities"

export interface LockParser {
  parseTokenLock(box: ErgoBox): TokenLock | undefined
}

export function mkLockParser(): LockParser {
  return new DefaultLockParser()
}

class DefaultLockParser implements LockParser {
  parseTokenLock(box: ErgoBox): TokenLock | undefined {
    const r4 = box.additionalRegisters[RegisterId.R4]
    const r5 = box.additionalRegisters[RegisterId.R5]
    if (r4 && r5) {
      const lockedAsset = box.assets[0]
      const r4c = deserializeConstant(r4)
      const deadline = r4c instanceof Int32Constant ? r4c.value : undefined
      const r5c = deserializeConstant(r5)
      const redeemer = r5c instanceof SigmaPropConstant ? r5c.value : undefined
      return lockedAsset && deadline && redeemer
        ? {
            boxId: box.boxId,
            lockedAsset: AssetAmount.fromToken(lockedAsset),
            deadline,
            redeemer
          }
        : undefined
    } else return undefined
  }
}
