import {BlocktimeMillis} from "../constants"

const HOUR_MILLIS: number = 60 * 60_000;
const DAY_MILLIS: number = 24 * HOUR_MILLIS;
const WEEK_MILLIS: number = 7 * DAY_MILLIS;
const MONTH_MILLIS: number = 4 * WEEK_MILLIS;

export function blocksToMillis(blocks: number): bigint {
  return BigInt(blocks) * BlocktimeMillis
}

export function millisToBlocks(millis: bigint): number {
  return Number(millis / BlocktimeMillis)
}

export function blocksToTimestamp(currentHeight: number, block: number) {
  return Date.now() + Number(blocksToMillis(block - currentHeight - 1));
}

export function timestampToBlocks(currentHeight: number, timestamp: number) {
  return currentHeight + millisToBlocks(BigInt(timestamp - Date.now())) + 1;
}

export function hoursCountToBlocks (hoursCount: number): number {
  return millisToBlocks(BigInt(hoursCount * HOUR_MILLIS));
}

export function daysCountToBlocks (daysCount: number): number {
  return millisToBlocks(BigInt(daysCount * DAY_MILLIS));
}

export function weeksCountToBlocks (weeksCount: number): number {
  return millisToBlocks(BigInt(weeksCount * WEEK_MILLIS));
}

export function monthCountToBlocks (monthCount: number): number {
  return millisToBlocks(BigInt(monthCount * MONTH_MILLIS));
}
