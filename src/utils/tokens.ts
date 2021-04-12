import {Eip4Token} from "../entities/eip4Token";
import {AssetAmount} from "../entities/assetAmount";
import {ErgoBox, Token as Asset} from "ergo-lib-wasm-browser";

export function aggregateTokens(tokens: Asset[], boxes: ErgoBox[]): AssetAmount[] {
    let assets: Asset[] = []
    for (let box of boxes) {
        let boxTokens = box.tokens()
        for (let i = 0; i < boxTokens.len(); i++) {
            assets.push(boxTokens.get(i))
        }
    }
    let aggregated: AssetAmount[] = []
    for (let token of tokens) {
        let total = assets.filter((a, _i, _xs) => a.id() == token.id)
            .map((a, _i, _xs) => a.amount().as_i64())
            .reduce((acc, x, _i, _xs) => acc.checked_add(x))
        aggregated.push(new AssetAmount(token, BigInt(total.as_num())))
    }
    return aggregated
}