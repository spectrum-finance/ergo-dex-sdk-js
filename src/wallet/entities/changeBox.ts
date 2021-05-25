import {TokenAmount} from "./tokenAmount";

export type ChangeBox = {
    readonly value: bigint,
    readonly assets: TokenAmount[]
}