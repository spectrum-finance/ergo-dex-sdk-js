import {BlocktimeMillis} from "../constants"

export function blocksToMillis(blocks: number): bigint {
  return BigInt(blocks) * BlocktimeMillis
}

export function millisToBlocks(millis: bigint): number {
  return Number(millis / BlocktimeMillis)
}
