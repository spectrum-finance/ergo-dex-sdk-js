import {PublicKey} from "../../wallet/types";
import {PoolId} from "../types";
import {Eip4Token} from "../../entities/eip4Token";

export class RedeemParams {
    readonly poolId: PoolId
    readonly pk: PublicKey
    readonly lp: Eip4Token

    constructor(poolId: PoolId, pk: PublicKey, lp: Eip4Token) {
        this.poolId = poolId
        this.pk = pk
        this.lp = lp
    }
}