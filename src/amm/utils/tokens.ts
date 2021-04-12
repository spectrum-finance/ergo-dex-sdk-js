import {MintToken, TokenId} from "../../wallet/types";
import {Eip4Token} from "../../entities/eip4Token";
import {EmissionLP} from "../constants";

export function mintLP(id: TokenId, tickerX: string, tickerY: string): MintToken {
    let tokenTickerLP = `${tickerX}_${tickerY}_LP`
    let tokenDescriptionLP = `${tickerX}|${tickerY} AMM Pool LP tokens`
    let tokenDecimalsLP = 0
    let tokenLP = new Eip4Token(id, tokenTickerLP, tokenDecimalsLP, tokenDescriptionLP)
    return {token: tokenLP, amount: EmissionLP}
}

export function mintPoolNFT(id: TokenId, tickerX: string, tickerY: string): MintToken {
    let tokenTickerNFT = `${tickerX}_${tickerY}_NFT`
    let tokenDescriptionNFT = `${tickerX}|${tickerY} AMM Pool NFT token`
    let tokenDecimalsNFT = 0
    let tokenNFT = new Eip4Token(id, tokenTickerNFT, tokenDecimalsNFT, tokenDescriptionNFT)
    return {token: tokenNFT, amount: 1n}
}
