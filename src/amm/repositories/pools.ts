import {PoolId} from "../types";
import {AmmPool} from "../entities/ammPool";
import {ErgoNetwork} from "../../services/ergoNetwork";
import {AssetAmount} from "../../wallet/entities/assetAmount";
import {Int32Constant} from "../../wallet/entities/constant";
import * as templates from "../contracts/templates";

export interface Pools {

    get(id: PoolId): Promise<AmmPool | undefined>

    getAll(offset: number, limit: number): Promise<AmmPool[]>
}

export class NetworkPools implements Pools {

    constructor(readonly network: ErgoNetwork) {
    }

    async get(id: PoolId): Promise<AmmPool | undefined> {
        let boxes = await this.network.getUnspentByTokenId(id, {offset: 0, limit: 1})
        if (boxes.length > 0) {
            let poolBox = boxes[0]
            let assetX = AssetAmount.fromToken(poolBox.tokens[2])
            let assetY = AssetAmount.fromToken(poolBox.tokens[3])
            let R4 = poolBox.additionalRegisters.get("R4")

            if (R4 instanceof Int32Constant) // todo: check poolScriptHash
                return new AmmPool(id, assetX, assetY, "", R4.value)
        }
    }

    async getAll(offset: number, limit: number): Promise<AmmPool[]> {
        let boxes = await this.network.getUnspentByErgoTreeTemplateHash(templates.T2tPool, {
            offset: offset,
            limit: limit
        })
        let pools = []
        for (let box of boxes) {
            let nft = box.tokens[0].tokenId
            let assetX = AssetAmount.fromToken(box.tokens[2])
            let assetY = AssetAmount.fromToken(box.tokens[3])
            let R4 = box.additionalRegisters.get("R4")

            if (R4 instanceof Int32Constant)
                pools.push(new AmmPool(nft, assetX, assetY, "", R4.value))
        }
        return pools
    }
}
