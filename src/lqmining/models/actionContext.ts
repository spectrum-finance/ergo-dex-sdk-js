import {Address} from "@ergolabs/ergo-sdk"
import {NetworkContext} from "@ergolabs/ergo-sdk/build/main/entities/networkContext"

export type ActionContext = {
  readonly changeAddress: Address
  readonly minBoxValue: bigint
  readonly minerFee: bigint
  readonly uiFee: bigint
  readonly network: NetworkContext
}
