import {Eip4Asset} from "./eip4Asset";
import {I64, Token as LibToken, TokenAmount as LibTokenAmount, TokenId as LibTokenId} from "ergo-lib-wasm-browser";

export class AssetAmount {
    readonly asset: Eip4Asset
    readonly amount: bigint

    constructor(asset: Eip4Asset, amount: bigint) {
        this.asset = asset
        this.amount = amount
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