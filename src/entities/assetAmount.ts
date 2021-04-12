import {Asset} from "./asset";
import {I64, Token as LibToken, TokenAmount as LibTokenAmount, TokenId as LibTokenId} from "ergo-lib-wasm-browser";

export class AssetAmount {
    readonly asset: Asset
    readonly amount: bigint

    constructor(asset: Asset, amount: bigint) {
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

    toErgoLib(): LibToken {
        return new LibToken(LibTokenId.from_str(this.asset.id), LibTokenAmount.from_i64(I64.from_str(this.amount.toString())))
    }
}