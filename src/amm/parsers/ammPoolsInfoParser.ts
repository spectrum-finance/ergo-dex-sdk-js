import {AssetAmount, ErgoBox} from "../../ergo"
import {AmmPoolInfo} from "../models/ammPoolInfo"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import * as T2T from "../contracts/t2tTemplates"

export interface AmmPoolsInfoParser {
  /** Parse AMM pool info from a given box.
   */
  parse(bx: ErgoBox): AmmPoolInfo | undefined
}

const AllowedPoolTemplates = [T2T.PoolTemplate]

export class DefaultAmmPoolsInfoParser implements AmmPoolsInfoParser {
  parse(bx: ErgoBox): AmmPoolInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    const validScript = AllowedPoolTemplates.includes(template)
    const poolId = bx.assets[0]?.tokenId
    const lp = bx.assets[1]
    const reservesX = bx.assets[2]
    const reservesY = bx.assets[3]
    return validScript && poolId && reservesX && reservesY
      ? {
          id: poolId,
          reservesX: AssetAmount.fromToken(reservesX),
          reservesY: AssetAmount.fromToken(reservesY),
          lp: AssetAmount.fromToken(lp)
        }
      : undefined
  }
}
