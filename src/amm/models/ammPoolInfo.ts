import {AssetAmount} from "../../ergo"
import {PoolId} from "../types"

export type AmmPoolInfo = {
  id: PoolId
  lp: AssetAmount
  reservesX: AssetAmount
  reservesY: AssetAmount
}
