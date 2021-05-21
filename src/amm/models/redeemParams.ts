import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {Eip4Token} from "../../wallet/entities/eip4Token";

export class RedeemParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly pk: PublicKey,
        public readonly lp: Eip4Token,
        public readonly dexFee: bigint
    ) {}
}