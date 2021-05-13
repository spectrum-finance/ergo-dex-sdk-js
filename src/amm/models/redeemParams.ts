import {PublicKey} from "../../wallet/types";
import {PoolId} from "../types";
import {Eip4Token} from "../../entities/eip4Token";

export class RedeemParams {
    readonly poolId: PoolId
    readonly pk: PublicKey
    readonly lp: Eip4Token
    readonly dexFee: bigint

    constructor(poolId: PoolId, pk: PublicKey, lp: Eip4Token, dexFee: bigint) {
        this.poolId = poolId
        this.pk = pk
        this.lp = lp
        this.dexFee = dexFee
    }
}