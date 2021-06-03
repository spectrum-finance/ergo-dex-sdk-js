import {AssetInfo} from "./assetInfo"
import {TokenAmount} from "./tokenAmount"

export class AssetAmount {
  constructor(public readonly asset: AssetInfo, public readonly amount: bigint) {}

  static fromToken(token: TokenAmount): AssetAmount {
    return new this(
      {
        id: token.tokenId,
        name: token.name,
        decimals: token.decimals,
      },
      BigInt(token.amount)
    )
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
