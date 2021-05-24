import {PoolId} from "../types";
import {AssetInfo, PublicKey} from "../../wallet";

export type DepositParams = {
    readonly poolId: PoolId,
    readonly x: AssetInfo,
    readonly y: AssetInfo,
    readonly pk: PublicKey,
    readonly dexFee: bigint
}