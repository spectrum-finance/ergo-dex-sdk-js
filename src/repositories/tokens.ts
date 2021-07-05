import {ErgoNetwork} from "../services/ergoNetwork"
import {TokenId, AssetInfo} from "../ergo"

export interface Tokens {
  /** Get a token by id.
   */
  get(id: TokenId): Promise<AssetInfo | undefined>
}

export class NetworkTokens implements Tokens {
  constructor(public readonly network: ErgoNetwork) {}

  get(id: TokenId): Promise<AssetInfo | undefined> {
    return this.network.getFullTokenInfo(id)
  }
}
