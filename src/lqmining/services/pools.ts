import {ErgoNetwork} from "@ergolabs/ergo-sdk"
import {makePools, Pools} from "../../services/pools"
import * as PV from "../contracts/poolValidator"
import {LmPool} from "../entities/lmPool"
import {LmPoolFromBox} from "../parsers/lmPoolFromBox"

export function makeLmPools(network: ErgoNetwork): Pools<LmPool> {
  return makePools(network, new LmPoolFromBox(), PV.poolBundle())
}
