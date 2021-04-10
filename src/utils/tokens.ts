import {Token} from "../entities/token";
import {TokenAmount} from "../entities/tokenAmount";
import {ErgoBox, Token as Asset} from "ergo-lib-wasm-browser";

export function aggregateTokens(tokens: Token[], boxes: ErgoBox[]): TokenAmount[] {
    let assets: Asset[] = []
    for (let box of boxes) {
        let boxTokens = box.tokens()
        for (let i = 0; i < boxTokens.len(); i++) {
            assets.push(boxTokens.get(i))
        }
    }
    let aggregated: TokenAmount[] = []
    for (let token of tokens) {
        let total = assets.filter((a, _i, _xs) => a.id() == token.id)
            .map((a, _i, _xs) => a.amount().as_i64())
            .reduce((acc, x, _i, _xs) => acc.checked_add(x))
        aggregated.push(new TokenAmount(token, BigInt(total.as_num())))
    }
    return aggregated
}