import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {Eip4Asset} from "../../wallet/entities/eip4Asset";

export class DepositParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly x: Eip4Asset,
        public readonly y: Eip4Asset,
        public readonly pk: PublicKey,
        public readonly dexFee: bigint
    ) {}
}