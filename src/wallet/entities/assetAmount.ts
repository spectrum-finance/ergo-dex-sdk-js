import {AssetInfo} from "./assetInfo";
import {I64, Token as LibToken, TokenAmount as LibTokenAmount, TokenId as LibTokenId} from "ergo-lib-wasm-browser";
import {Token} from "./token";

export class AssetAmount {

    constructor(
        public readonly asset: AssetInfo,
        public readonly amount: bigint
    ) {}

    static fromToken(token: Token): AssetAmount {
        return new this(new AssetInfo(token.tokenId, token.name, token.decimals), token.amount)
    }

    withAmount(amount: bigint): AssetAmount {
        return new AssetAmount(this.asset, amount)
    }

    add(n: bigint | AssetAmount): AssetAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount + n)
        } else {
            return this.withAmount(this.amount + n.amount)
        }
    }

    sub(n: bigint | AssetAmount): AssetAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount - n)
        } else {
            return this.withAmount(this.amount - n.amount)
        }
    }

    mul(n: bigint | AssetAmount): AssetAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount * n)
        } else {
            return this.withAmount(this.amount * n.amount)
        }
    }

    div(n: bigint | AssetAmount): AssetAmount {
        if (typeof n === "bigint") {
            return this.withAmount(this.amount / n)
        } else {
            return this.withAmount(this.amount / n.amount)
        }
    }
}