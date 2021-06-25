import axios, {AxiosInstance} from "axios"
import {ErgoTree, AssetInfo, ErgoBox, HexString, TokenId} from "../ergo"
import * as network from "../network/models"
import {Paging} from "../network/paging"
import {NetworkContext} from "../ergo/entities/networkContext"
import {BoxSearch} from "../network/models"

export interface ErgoNetwork {
  /** Get unspent boxes with a given ErgoTree.
   */
  getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<[ErgoBox[], number]>

  /** Get unspent boxes with scripts matching a given template hash.
   */
  getUnspentByErgoTreeTemplate(hash: HexString, paging: Paging): Promise<ErgoBox[]>

  /** Get unspent boxes containing a token with given id.
   */
  getUnspentByTokenId(tokenId: TokenId, paging: Paging): Promise<ErgoBox[]>

  /** Get unspent boxes by a given hash of ErgoTree template.
   */
  getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<[ErgoBox[], number]>

  /** Detailed search among unspent boxes.
   */
  searchUnspentBoxes(req: BoxSearch, paging: Paging): Promise<[ErgoBox[], number]>

  /** Get a token info by id.
   */
  getToken(tokenId: TokenId): Promise<AssetInfo | undefined>

  /** Get all available tokens.
   */
  getTokens(paging: Paging): Promise<[AssetInfo[], number]>

  /** Get current network context.
   */
  getNetworkContext(): Promise<NetworkContext>
}

export class Explorer implements ErgoNetwork {
  readonly backend: AxiosInstance

  constructor(uri: string) {
    this.backend = axios.create({
      baseURL: uri,
      timeout: 5000,
      headers: {"Content-Type": "application/json"}
    })
  }

  async getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTree/${tree}`,
        params: paging
      })
      .then(res => [res.data.items.map((b, _ix, _xs) => network.toWalletErgoBox(b)), res.data.total])
  }

  async getUnspentByErgoTreeTemplate(templateHash: HexString, paging: Paging): Promise<ErgoBox[]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTreeTemplateHash/${templateHash}`,
        params: paging
      })
      .then(res => res.data.items.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
  }

  async getUnspentByTokenId(tokenId: TokenId, paging: Paging): Promise<ErgoBox[]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byTokenId/${tokenId}`,
        params: paging
      })
      .then(res => res.data.items.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
  }

  async getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTreeTemplateHash/${hash}`,
        params: paging
      })
      .then(res => [res.data.items.map((b, _ix, _xs) => network.toWalletErgoBox(b)), res.data.total])
  }

  searchUnspentBoxes(req: BoxSearch, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/search`,
        params: paging,
        method: "POST",
        data: req
      })
      .then(res => [res.data.items.map((b, _ix, _xs) => network.toWalletErgoBox(b)), res.data.total])
  }

  async getToken(tokenId: TokenId): Promise<AssetInfo | undefined> {
    return this.backend
      .request<AssetInfo>({
        url: `/api/v1/tokens/${tokenId}`
      })
      .then(res => (res.status != 404 ? res.data : undefined))
  }

  async getTokens(paging: Paging): Promise<[AssetInfo[], number]> {
    return this.backend
      .request<network.Items<AssetInfo>>({
        url: `/api/v1/tokens`,
        params: paging
      })
      .then(res => [res.data.items, res.data.total])
  }

  async getNetworkContext(): Promise<NetworkContext> {
    return this.backend
      .request<NetworkContext>({
        url: `/api/v1/epochs/params`
      })
      .then(res => res.data)
  }
}
