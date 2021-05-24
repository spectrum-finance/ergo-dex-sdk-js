import {TokenAmount} from "./tokenAmount";

export type OverallAmount = {
    nErgs: bigint,
    tokens: TokenAmount[]
}