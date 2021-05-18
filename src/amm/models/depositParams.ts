import {PublicKey} from "../../wallet/entities/publicKey";
import {PoolId} from "../types";
import {Eip4Token} from "../../wallet/entities/eip4Token";

export class DepositParams {
    constructor(
        public readonly poolId: PoolId,
        public readonly x: Eip4Token,
        public readonly y: Eip4Token,
        public readonly pk: PublicKey,
        public readonly dexFee: bigint
    ) {}
}