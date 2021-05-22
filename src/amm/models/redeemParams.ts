import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {AssetInfo} from "../../wallet/entities/assetInfo";

export class RedeemParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly pk: PublicKey,
        public readonly lp: AssetInfo,
        public readonly dexFee: bigint
    ) {}
}