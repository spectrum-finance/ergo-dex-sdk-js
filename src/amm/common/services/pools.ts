import {ErgoNetwork} from "@ergolabs/ergo-sdk"
import {makePools, Pools} from "../../../services/pools"
import * as N2T from "../../contracts/n2tPoolContracts"
import * as T2T from "../../contracts/t2tPoolContracts"
import {AmmPool} from "../entities/ammPool"
import {N2TAmmPoolsParser, T2TAmmPoolsParser} from "../parsers/ammPoolsParser"

export function makeNativePools(network: ErgoNetwork): Pools<AmmPool> {
  return makePools(network, new N2TAmmPoolsParser(), N2T.poolBundle())
}

export function makeTokenPools(network: ErgoNetwork): Pools<AmmPool> {
  return makePools(network, new T2TAmmPoolsParser(), T2T.poolBundle())
}
