import axios, {AxiosInstance} from "axios"
import {ErgoTree, ErgoBox, HexString, TokenId, TxId, ErgoTx, BoxId, Address} from "../ergo"
import * as network from "../network/models"
import {Paging} from "../network/paging"
import {NetworkContext} from "../ergo/entities/networkContext"
import {BoxAssetsSearch, BoxSearch, fixErgoBox, FullAssetInfo} from "../network/models"
import {Sorting} from "../network/sorting"
import {fixFullOutput, FullOutput} from "../ergo/entities/ergoBox"
import JSONBigInt from "json-bigint"
import {fixErgoTx} from "../ergo/entities/ergoTx"

export interface ErgoNetwork {
  /** Get confirmed transaction by id.
   */
  getTx(id: TxId): Promise<ErgoTx | undefined>

  /** Get confirmed output by id.
   */
  getOutput(id: BoxId): Promise<FullOutput | undefined>

  /** Get transactions by address.
   */
  getTxsByAddress(address: Address, paging: Paging): Promise<[ErgoTx[], number]>

  /** Get unspent boxes with a given ErgoTree.
   */
  getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<[ErgoBox[], number]>

  /** Get unspent boxes with scripts matching a given template hash.
   */
  getUnspentByErgoTreeTemplate(hash: HexString, paging: Paging): Promise<ErgoBox[]>

  /** Get unspent boxes containing a token with given id.
   */
  getUnspentByTokenId(tokenId: TokenId, paging: Paging, sort?: Sorting): Promise<ErgoBox[]>

  /** Get unspent boxes by a given hash of ErgoTree template.
   */
  getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<[ErgoBox[], number]>

  /** Detailed search among unspent boxes.
   */
  searchUnspentBoxes(req: BoxSearch, paging: Paging): Promise<[ErgoBox[], number]>

  /** Search among unspent boxes by ergoTreeTemplateHash and tokens..
   */
  searchUnspentBoxesByTokensUnion(req: BoxAssetsSearch, paging: Paging): Promise<[ErgoBox[], number]>

  /** Get a token info by id.
   */
  getFullTokenInfo(tokenId: TokenId): Promise<FullAssetInfo | undefined>

  /** Get all available tokens.
   */
  getTokens(paging: Paging): Promise<[FullAssetInfo[], number]>

  /** Get current network context.
   */
  getNetworkContext(): Promise<NetworkContext>
}

const JSONBI = JSONBigInt({useNativeBigInt: true})

export class Explorer implements ErgoNetwork {
  readonly backend: AxiosInstance

  constructor(uri: string) {
    this.backend = axios.create({
      baseURL: uri,
      timeout: 5000,
      headers: {"Content-Type": "application/json"}
    })
  }

  async getTx(id: TxId): Promise<ErgoTx | undefined> {
    return this.backend
      .request<ErgoTx>({
        url: `/api/v1/transactions/${id}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => fixErgoTx(res.data))
  }

  async getOutput(id: BoxId): Promise<FullOutput | undefined> {
    return this.backend
      .request<FullOutput>({
        url: `/api/v1/boxes/${id}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => fixFullOutput(res.data))
  }

  async getTxsByAddress(address: Address, paging: Paging): Promise<[ErgoTx[], number]> {
    return this.backend
      .request<network.Items<ErgoTx>>({
        url: `/api/v1/addresses/${address}/transactions`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(tx => fixErgoTx(tx)), res.data.total])
  }

  async getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTree/${tree}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [
        res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)),
        res.data.total
      ])
  }

  async getUnspentByErgoTreeTemplate(templateHash: HexString, paging: Paging): Promise<ErgoBox[]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTreeTemplateHash/${templateHash}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)))
  }

  async getUnspentByTokenId(tokenId: TokenId, paging: Paging, sort?: Sorting): Promise<ErgoBox[]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byTokenId/${tokenId}`,
        params: {...paging, sortDirection: sort || "asc"},
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)))
  }

  async getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/byErgoTreeTemplateHash/${hash}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [
        res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)),
        res.data.total
      ])
  }

  async searchUnspentBoxes(req: BoxSearch, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/search`,
        params: paging,
        method: "POST",
        data: req,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [
        res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)),
        res.data.total
      ])
  }

  async searchUnspentBoxesByTokensUnion(req: BoxAssetsSearch, paging: Paging): Promise<[ErgoBox[], number]> {
    return this.backend
      .request<network.Items<network.ErgoBox>>({
        url: `/api/v1/boxes/unspent/search/union`,
        params: paging,
        method: "POST",
        data: req,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [
        res.data.items.map(b => fixErgoBox(b)).map(b => network.toWalletErgoBox(b)),
        res.data.total
      ])
  }

  async getFullTokenInfo(tokenId: TokenId): Promise<FullAssetInfo | undefined> {
    return this.backend
      .request<FullAssetInfo>({
        url: `/api/v1/tokens/${tokenId}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => (res.status != 404 ? res.data : undefined))
  }

  async getTokens(paging: Paging): Promise<[FullAssetInfo[], number]> {
    return this.backend
      .request<network.Items<FullAssetInfo>>({
        url: `/api/v1/tokens`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
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
