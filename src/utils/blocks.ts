import {BlocktimeMillis} from "../constants"

export function blocksToMillisEstimate(blocks: number): bigint {
  return BigInt(blocks) * BlocktimeMillis
}
