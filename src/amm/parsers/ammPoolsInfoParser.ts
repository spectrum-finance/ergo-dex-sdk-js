import {AssetAmount, ErgoBox, treeTemplateFromErgoTree} from "ergo-sdk"
import {AmmPoolInfo} from "../models/ammPoolInfo"
import * as T2T from "../contracts/t2tTemplates"
import * as N2T from "../contracts/n2tTemplates"

export interface AmmPoolsInfoParser {
  /** Parse AMM pool info from a given box.
   */
  parse(bx: ErgoBox): AmmPoolInfo | undefined
}

export class DefaultAmmPoolsInfoParser implements AmmPoolsInfoParser {
  parse(bx: ErgoBox): AmmPoolInfo | undefined {
    const template = treeTemplateFromErgoTree(bx.ergoTree)
    if (template === T2T.PoolTemplate) return this.parseT2T(bx)
    else if (template === N2T.PoolTemplate) return this.parseN2T(bx)
    else return undefined
  }

  private parseT2T(bx: ErgoBox): AmmPoolInfo | undefined {
    const poolId = bx.assets[0]?.tokenId
    const lp = bx.assets[1]
    const reservesX = bx.assets[2]
    const reservesY = bx.assets[3]
    return poolId && reservesX && reservesY
      ? {
          id: poolId,
          reservesX: AssetAmount.fromToken(reservesX),
          reservesY: AssetAmount.fromToken(reservesY),
          lp: AssetAmount.fromToken(lp)
        }
      : undefined
  }

  private parseN2T(bx: ErgoBox): AmmPoolInfo | undefined {
    const poolId = bx.assets[0]?.tokenId
    const lp = bx.assets[1]
    const reservesY = bx.assets[2]
    return poolId && reservesY
      ? {
          id: poolId,
          reservesX: AssetAmount.native(bx.value),
          reservesY: AssetAmount.fromToken(reservesY),
          lp: AssetAmount.fromToken(lp)
        }
      : undefined
  }
}
