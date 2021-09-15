import {MinBoxValue} from "@ergolabs/ergo-sdk"
import {MinPoolBoxValue} from "../constants"

export function minAmountNErgsForOrder(minerFee: bigint, uiFee: bigint): bigint {
  return minerFee * 2n + uiFee + MinBoxValue * 2n
}

export function minAmountNErgsForSetup(minerFee: bigint, uiFee: bigint): bigint {
  return minerFee * 2n + uiFee + MinBoxValue + MinPoolBoxValue
}
