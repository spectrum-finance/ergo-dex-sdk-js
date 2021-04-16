import {PublicKey} from "../../wallet/types";
import {PoolId} from "../types";
import {Eip4Token} from "../../entities/eip4Token";

export class DepositParams {
    readonly poolId: PoolId
    readonly x: Eip4Token
    readonly y: Eip4Token
    readonly pk: PublicKey

    constructor(poolId: PoolId, x: Eip4Token, y: Eip4Token, pk: PublicKey) {
        this.poolId = poolId
        this.x = x
        this.y = y
        this.pk = pk
    }
}