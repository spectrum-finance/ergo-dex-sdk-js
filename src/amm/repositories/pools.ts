import {PoolId} from "../types";
import {AmmPool} from "../entities/ammPool";
import {ErgoNetwork} from "../../services/ergoNetwork";
import {AssetAmount} from "../../wallet/entities/assetAmount";
import {Int32Constant} from "../../wallet/entities/constant";

export interface Pools {

    get(id: PoolId): Promise<AmmPool | undefined>

    getAll(offset: number, limit: number): Promise<AmmPool[]>
}

export class NetworkPools implements Pools {

    constructor(readonly network: ErgoNetwork) {}

    async get(id: PoolId): Promise<AmmPool | undefined> {
        let boxes = await this.network.getUnspentByTokenId(id)
        if (boxes.length > 0) { // todo: check poolScriptHash
            let poolBox = boxes[0]
            let assetX = AssetAmount.fromToken(poolBox.tokens[2])
            let assetY = AssetAmount.fromToken(poolBox.tokens[3])
            let R4 = poolBox.additionalRegisters.get("R4")
            if (R4 instanceof Int32Constant) {
                return new AmmPool(id, assetX, assetY, "", R4.value)
            }
        }
    }

    getAll(offset: number, limit: number): Promise<AmmPool[]> {
        return Promise.reject();
    }
}
