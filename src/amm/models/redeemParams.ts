import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {Eip4Asset} from "../../wallet/entities/eip4Asset";

export class RedeemParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly pk: PublicKey,
        public readonly lp: Eip4Asset,
        public readonly dexFee: bigint
    ) {}
}