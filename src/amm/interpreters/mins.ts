import {MinBoxValue} from "@ergolabs/ergo-sdk"
import {MinPoolBoxValue} from "../common/constants"

export function minValueForOrder(minerFee: bigint, uiFee: bigint, exFee: bigint): bigint {
  return minerFee + uiFee + exFee + MinBoxValue
}

export function minValueForSetup(minerFee: bigint, uiFee: bigint): bigint {
  return minerFee * 2n + uiFee + MinBoxValue + MinPoolBoxValue
}
