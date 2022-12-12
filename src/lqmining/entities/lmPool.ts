import {AssetAmount} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type LmPoolConfig = {
  epochLen: number
  epochNum: number
  programStart: number
  programBudget: bigint
}

export class LmPool {
  constructor(
    public readonly id: PoolId,
    public readonly conf: LmPoolConfig,
    public readonly budget: AssetAmount,
    public readonly lq: AssetAmount,
    public readonly vlq: AssetAmount,
    public readonly tt: AssetAmount
  ) {}

  get epochAlloc(): bigint {
    return this.conf.programBudget / BigInt(this.conf.epochNum)
  }

  numEpochsRemain(height: number): number {
    return this.conf.epochNum - this.currentEpoch(height)
  }

  currentEpoch(height: number): number {
    const curBlockIx = height - this.conf.programStart + 1
    const curEpochIxRem = curBlockIx % this.conf.epochLen
    const curEpochIxR = Math.floor(curBlockIx / this.conf.epochLen)
    if (curEpochIxRem > 0) {
      return curEpochIxR + 1
    } else {
      return curEpochIxR
    }
  }
}
