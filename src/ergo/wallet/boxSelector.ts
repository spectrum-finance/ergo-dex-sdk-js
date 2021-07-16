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
    let totalNErgs = inputs.map((bx, _ix, _xs) => bx.value).reduce((acc, value, _ix, _xs) => acc + value, 0n)
    let totalAssets = new Map<TokenId, bigint>()
    for (let t of inputs.flatMap((bx, _ix, _xs) => bx.assets)) {
      let acc = totalAssets.get(t.tokenId) || 0n
      totalAssets.set(t.tokenId, t.amount + acc)
    }
    let deltaNErgs = totalNErgs - target.nErgs
    let deltaAssets: TokenAmount[] = []
    for (let [id, totalAmt] of totalAssets) {
      let targetAmt = target.assets.find((a, _i, _xs) => a.tokenId === id)?.amount || 0n
      deltaAssets.push({tokenId: id, amount: totalAmt - targetAmt})
    }
    if (deltaNErgs < 0)
      return new InsufficientInputs(`'NErgs' required: ${target.nErgs}, given: ${totalNErgs}`)
    else if (!deltaAssets.every((a, _ix, _xs) => a.amount >= 0)) {
      let failedAsset = deltaAssets.find((a, _ix, _xs) => a.amount < 0)!
      let assetName = failedAsset.name || failedAsset.tokenId
      let givenAmount = totalAssets.get(failedAsset.tokenId) || 0n
      let requiredAmount = givenAmount - failedAsset.amount
      return new InsufficientInputs(`'${assetName}' required: ${requiredAmount}, given: ${givenAmount}`)
    } else {
      let changeRequired = !(deltaNErgs === 0n && deltaAssets.every((a, _ix, _xs) => a.amount === 0n))
      let change = changeRequired
        ? {
            value: deltaNErgs,
            assets: deltaAssets.filter((a, _ix, _xs) => a.amount > 0)
          }
        : undefined
      return BoxSelection.make(inputs, change) || new InsufficientInputs("Inputs are empty")
    }
  }
}

export const DefaultBoxSelector = new DefaultBoxSelectorImpl()
