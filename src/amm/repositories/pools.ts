import {PoolId} from "../types";
import {AmmPool} from "../entities/ammPool";
import {ErgoNetwork} from "../../services/ergoNetwork";
import {AssetAmount, Int32Constant} from "../../wallet";
import {RegisterId} from "../../wallet/entities/registers";
import {Blake2b256} from "../../utils/blake2b256";
import {toHex} from "../../utils/hex";
import {T2tPoolContracts} from "../contracts/t2tPoolContracts";
import {EmissionLP} from "../constants";
import {Paging} from "../../network/paging";

export interface Pools {

    get(id: PoolId): Promise<AmmPool | undefined>

    getAll(paging: Paging): Promise<AmmPool[]>
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
            let r4 = poolBox.additionalRegisters.get(RegisterId.R4)
            if (r4 instanceof Int32Constant && poolBox.ergoTree === T2tPoolContracts.pool(EmissionLP)) {
                let scriptHash = toHex(Blake2b256.hash(poolBox.ergoTree))
                return new AmmPool(id, assetX, assetY, scriptHash, r4.value)
            }
        }
    }

    async getAll(paging: Paging): Promise<AmmPool[]> {
        let boxes = await this.network.getUnspentByErgoTreeTemplateHash(
            T2tPoolContracts.poolTemplateHash(EmissionLP),
            paging
        )
        let pools = []
        for (let box of boxes) {
            let nft = box.tokens[0].id
            let assetX = AssetAmount.fromToken(box.tokens[2])
            let assetY = AssetAmount.fromToken(box.tokens[3])
            let r4 = box.additionalRegisters.get(RegisterId.R4)
            if (r4 instanceof Int32Constant) {
                let scriptHash = toHex(Blake2b256.hash(box.ergoTree))
                pools.push(new AmmPool(nft, assetX, assetY, scriptHash, r4.value))
            }
        }
        return pools
    }
}
