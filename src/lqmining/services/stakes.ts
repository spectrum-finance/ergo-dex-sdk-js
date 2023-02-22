import {ErgoNetwork, Paging, TokenId} from "@ergolabs/ergo-sdk"
import {BoxAssetsSearch} from "@ergolabs/ergo-sdk/build/main/network/models"
import {FromBox} from "../../fromBox"
import {StakingBundleTemplateHash} from "../contracts/templates"
import {Stake} from "../models/stake"

export interface Stakes {
  /** Search stakes by staking keys.
   */
  searchByKeys(stakingKeys: TokenId[], paging: Paging): Promise<[Stake[], number]>
}

export function makeStakes(network: ErgoNetwork, parser: FromBox<Stake>): Stakes {
  return new NetworkStakes(network, parser)
}

class NetworkStakes implements Stakes {
  constructor(public readonly network: ErgoNetwork, public readonly parser: FromBox<Stake>) {}

  async searchByKeys(stakingKeys: TokenId[], paging: Paging): Promise<[Stake[], number]> {
    const req: BoxAssetsSearch = {ergoTreeTemplateHash: StakingBundleTemplateHash, assets: stakingKeys}
    const [boxes, totalBoxes] = await this.network.searchUnspentBoxesByTokensUnion(req, paging)
    const stakes = this.parser.fromMany(boxes)
    const invalid = boxes.length - stakes.length
    const total = totalBoxes - invalid
    return [stakes, total]
  }
}
