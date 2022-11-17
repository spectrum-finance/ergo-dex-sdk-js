import {Paging, TokenId} from "@ergolabs/ergo-sdk"
import {LmPool} from "../entities/lmPool"
import {PoolId} from "../types"

export interface LmPools {
  /** Get a pool by the given pool `id`.
   */
  get(poolId: PoolId): Promise<LmPool | undefined>

  /** Get all pools from the network.
   */
  getAll(paging: Paging): Promise<[LmPool[], number]>

  /** Get pools containing all of given tokens from the network.
   */
  getByTokens(tokens: TokenId[], paging: Paging): Promise<[LmPool[], number]>

  /** Get pools containing any of the given tokens from the network.
   */
  getByTokensUnion(tokens: TokenId[], paging: Paging): Promise<[LmPool[], number]>
}
