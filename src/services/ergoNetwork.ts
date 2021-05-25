import {HexString, TokenId} from "../ergo/types";
import {ErgoBox} from "../ergo/entities/ergoBox";
import axios, {AxiosInstance} from "axios";
import {ErgoTree} from "../ergo/entities/ergoTree";
import {AssetInfo} from "../ergo/entities/assetInfo";
import * as network from "../network/models";
import {Paging} from "../network/paging";

export interface ErgoNetwork {

    /** Get unspent boxes with a given ErgoTree.
     */
    getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<ErgoBox[]>

    /** Get unspent boxes with scripts matching a given template hash.
     */
    getUnspentByErgoTreeTemplate(hash: HexString, paging: Paging): Promise<ErgoBox[]>

    /** Get unspent boxes containing a token with given id.
     */
    getUnspentByTokenId(tokenId: TokenId, paging: Paging): Promise<ErgoBox[]>

    /** Get unspent boxes by a given hash of ErgoTree template.
     */
    getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<ErgoBox[]>

    /** Get a token info by id.
     */
    getToken(tokenId: TokenId): Promise<AssetInfo | undefined>
}

export class Explorer implements ErgoNetwork {

    readonly backend: AxiosInstance

    constructor(uri: string) {
        this.backend = axios.create({
            baseURL: uri,
            timeout: 5000,
            headers: {'Content-Type': 'application/json'},
        })
    }

    async getUnspentByErgoTree(tree: ErgoTree, paging: Paging): Promise<ErgoBox[]> {
        return this.backend.request<network.ErgoBox[]>({
            url: `/boxes/unspent/byErgoTree/${tree}`,
            params: paging
        }).then((res) => res.data.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
    }

    async getUnspentByErgoTreeTemplate(templateHash: HexString, paging: Paging): Promise<ErgoBox[]> {
        return this.backend.request<network.ErgoBox[]>({
            url: `/boxes/unspent/byErgoTreeTemplateHash/${templateHash}`,
            params: paging
        }).then((res) => res.data.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
    }

    async getUnspentByTokenId(tokenId: TokenId, paging: Paging): Promise<ErgoBox[]> {
        return this.backend.request<network.ErgoBox[]>({
            url: `/boxes/unspent/byTokenId/${tokenId}`,
            params: paging
        }).then((res) => res.data.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
    }

    async getUnspentByErgoTreeTemplateHash(hash: HexString, paging: Paging): Promise<ErgoBox[]> {
        return this.backend.request<network.ErgoBox[]>({
            url: `/boxes/unspent/byErgoTreeTemplateHash/${hash}`,
            params: paging
        }).then((res) => res.data.map((b, _ix, _xs) => network.toWalletErgoBox(b)))
    }

    async getToken(tokenId: TokenId): Promise<AssetInfo | undefined> {
        return this.backend.request<AssetInfo>({
            url: `/api/v1/tokens/${tokenId}`
        }).then((res) => res.status != 404 ? res.data : undefined)
    }
}
