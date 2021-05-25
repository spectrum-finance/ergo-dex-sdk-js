import {TokenAmount} from "../../entities/tokenAmount";

export type OverallAmount = {
    nErgs: bigint,
    tokens: TokenAmount[]
}