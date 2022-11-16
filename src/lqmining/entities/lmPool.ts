import {AssetAmount} from "@ergolabs/ergo-sdk"
import {PoolId} from "../types"

export type LmPoolConfig = {
  epochLen: number
  epochNum: number
  programStart: number
  programBudget: bigint
  execBudget: bigint
}

export class LmPool {
  constructor(
    public readonly id: PoolId,
    public readonly conf: LmPoolConfig,
    public readonly reward: AssetAmount,
    public readonly lq: AssetAmount,
    public readonly vlq: AssetAmount,
    public readonly tt: AssetAmount
  ) {}

  get epochAlloc(): bigint {
    return this.conf.programBudget / BigInt(this.conf.epochNum)
  }

  epochsLeft(currentHeight: number): number {
    return Math.floor(this.conf.epochNum - ((currentHeight - this.conf.programStart) / this.conf.epochLen))
  }
}
