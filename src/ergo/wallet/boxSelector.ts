import {ErgoBox} from "../entities/ergoBox"
import {OverallAmount} from "./entities/overallAmount"
import {BoxSelection} from "./entities/boxSelection"
import {InsufficientInputs} from "../errors/insufficientInputs"
import {TokenId} from "../types"
import {TokenAmount} from "../entities/tokenAmount"

export interface BoxSelector {
  /** Selects inputs to satisfy target balance and tokens.
   */
  select(inputs: ErgoBox[], target: OverallAmount): BoxSelection | InsufficientInputs
}

class DefaultBoxSelectorImpl implements BoxSelector {
  select(inputs: ErgoBox[], target: OverallAmount): BoxSelection | InsufficientInputs {
    const sufficientInputs: ErgoBox[] = []
    let totalNErgs = 0n
    const totalAssets = new Map<TokenId, bigint>()
    const targetAssetIds = target.assets.map(a => a.tokenId)
    const sortedInputs = inputs.slice(0).sort((bx0, bx1) => {
      let entries0 = 0
      let entries1 = 0
      bx0.assets.forEach(a => {
        if (targetAssetIds.includes(a.tokenId)) entries0++
      })
      bx1.assets.forEach(a => {
        if (targetAssetIds.includes(a.tokenId)) entries1++
      })
      if (entries0 > entries1) return -1
      else if (entries0 < entries1) return 1
      else return 0
    })
    for (const i of sortedInputs) {
      totalNErgs += i.value
      for (const t of i.assets) {
        const acc = totalAssets.get(t.tokenId) || 0n
        totalAssets.set(t.tokenId, t.amount + acc)
      }
      sufficientInputs.push(i)
      const sufficientErgs = totalNErgs >= target.nErgs
      const sufficientAssets = () =>
        target.assets
          .map(ta => (totalAssets.get(ta.tokenId) || 0n) >= ta.amount)
          .reduce((f0, f1) => f0 && f1, true)
      if (sufficientErgs && sufficientAssets()) break
    }
    const deltaNErgs = totalNErgs - target.nErgs
    const deltaAssets: TokenAmount[] = []
    for (const [id, totalAmt] of totalAssets) {
      const targetAmt = target.assets.find(a => a.tokenId === id)?.amount || 0n
      deltaAssets.push({tokenId: id, amount: totalAmt - targetAmt})
    }
    if (deltaNErgs < 0)
      return new InsufficientInputs(`'NErgs' required: ${target.nErgs}, given: ${totalNErgs}`)
    else if (!deltaAssets.every(a => a.amount >= 0)) {
      const failedAsset = deltaAssets.find(a => a.amount < 0)!
      const assetName = failedAsset.name || failedAsset.tokenId
      const givenAmount = totalAssets.get(failedAsset.tokenId) || 0n
      const requiredAmount = givenAmount - failedAsset.amount
      return new InsufficientInputs(`'${assetName}' required: ${requiredAmount}, given: ${givenAmount}`)
    } else {
      const changeRequired = !(deltaNErgs === 0n && deltaAssets.every(a => a.amount === 0n))
      const change = changeRequired
        ? {
            value: deltaNErgs,
            assets: deltaAssets.filter(a => a.amount > 0)
          }
        : undefined
      return BoxSelection.make(sufficientInputs, change) || new InsufficientInputs("Inputs are empty")
    }
  }
}

export const DefaultBoxSelector = new DefaultBoxSelectorImpl()
