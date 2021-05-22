import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {AssetInfo} from "../../wallet/entities/assetInfo";

export class DepositParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly x: AssetInfo,
        public readonly y: AssetInfo,
        public readonly pk: PublicKey,
        public readonly dexFee: bigint
    ) {}
}