import {AssetAmount, ErgoBox} from "../../ergo"
import {AmmPoolInfo} from "../models/ammPoolInfo"
import {treeTemplateFromErgoTree} from "../../ergo/entities/ergoTreeTemplate"
import * as T2T from "../contracts/t2tTemplates"
import * as N2T from "../contracts/n2tTemplates"

export interface AmmPoolsInfoParser {
  /** Parse AMM pool info from a given box.
   */
  parse(bx: ErgoBox): AmmPoolInfo | undefined
}

const AllowedT2TPoolTemplates = [T2T.PoolTemplate]

export class T2TAmmPoolsInfoParser implements AmmPoolsInfoParser {
  parse(bx: ErgoBox): AmmPoolInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    const validScript = AllowedT2TPoolTemplates.includes(template)
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

const AllowedN2TPoolTemplates = [N2T.PoolTemplate]

export class N2TAmmPoolsInfoParser implements AmmPoolsInfoParser {
  parse(bx: ErgoBox): AmmPoolInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    const validScript = AllowedN2TPoolTemplates.includes(template)
    const poolId = bx.assets[0]?.tokenId
    const lp = bx.assets[1]
    const reservesY = bx.assets[2]
    return validScript && poolId && reservesY
      ? {
          id: poolId,
          reservesX: AssetAmount.native(bx.value),
          reservesY: AssetAmount.fromToken(reservesY),
          lp: AssetAmount.fromToken(lp)
        }
      : undefined
  }
}
