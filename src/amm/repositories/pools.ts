import {PoolId} from "../types";
import {AmmPool} from "../entities/ammPool";

export interface Pools {

    get(id: PoolId): AmmPool | undefined

    getAll(offset: number, limit: number): AmmPool[]
}