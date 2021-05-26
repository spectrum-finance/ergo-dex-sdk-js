import { ErgoNetwork } from '../services/ergoNetwork';
import { AssetInfo } from '../wallet/entities/assetInfo';
import { TokenId } from '../wallet/types';

export interface Tokens {
  /** Get a token by id.
   */
  get(id: TokenId): Promise<AssetInfo | undefined>;
}

export class NetworkTokens implements Tokens {
  constructor(public readonly network: ErgoNetwork) {}

  get(id: TokenId): Promise<AssetInfo | undefined> {
    return this.network.getToken(id);
  }
}
