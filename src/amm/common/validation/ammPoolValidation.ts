import {ErgoNetwork, isNative} from "@ergolabs/ergo-sdk"
import {sqrt} from "../../../utils/sqrt"
import {OK, PoolValidation, ValidationResult} from "../../../validation/poolValidation"
import {BurnLP, EmissionLP} from "../constants"
import {AmmPool} from "../entities/ammPool"

class T2TAmmPoolValidation implements PoolValidation<AmmPool> {
  constructor(public readonly network: ErgoNetwork) {}

  async validate(pool: AmmPool): Promise<ValidationResult> {
    const nft = await this.network.getFullTokenInfo(pool.id)
    const lp = await this.network.getFullTokenInfo(pool.lp.asset.id)
    const poolBoxes = await this.network.getByTokenId(pool.id, {offset: 0, limit: 1})
    const genesisBox = poolBoxes[0]
    const errorsAcc = []
    if (nft && lp && genesisBox) {
      if (nft.emissionAmount != 1n)
        errorsAcc.push(`Wrong pool NFT emission amount. Required: 1, actual: ${nft.emissionAmount}`)

      const requiredEmission = EmissionLP - BurnLP
      if (lp.emissionAmount != requiredEmission)
        errorsAcc.push(
          `Wrong pool LP emission amount. Required: ${requiredEmission}, actual: ${lp.emissionAmount}`
        )

      const poolTokensNum = 4
      if (genesisBox.assets.length === poolTokensNum) {
        const [nft0, lp0, x0, y0] = genesisBox.assets
        if (nft0.amount !== 1n || nft0.tokenId !== pool.id) errorsAcc.push(`Wrong genesis NFT.`)
        const allowedLP = sqrt(x0.amount * y0.amount)
        const takenLP = requiredEmission - lp0.amount
        if (allowedLP < takenLP)
          errorsAcc.push(`Illegal pool initialization. Allowed LP: ${allowedLP}, taken: ${takenLP}`)
      } else {
        errorsAcc.push(
          `Wrong number of pool tokens. Required: ${poolTokensNum}, actual: ${genesisBox.assets.length}`
        )
      }
    }
    return errorsAcc.length > 0 ? errorsAcc : OK
  }
}

class N2TAmmPoolValidation implements PoolValidation<AmmPool> {
  constructor(public readonly network: ErgoNetwork) {}

  async validate(pool: AmmPool): Promise<ValidationResult> {
    const nft = await this.network.getFullTokenInfo(pool.id)
    const lp = await this.network.getFullTokenInfo(pool.lp.asset.id)
    const poolBoxes = await this.network.getByTokenId(pool.id, {offset: 0, limit: 1})
    const genesisBox = poolBoxes[0]
    const errorsAcc = []
    if (nft && lp && genesisBox) {
      if (nft.emissionAmount != 1n)
        errorsAcc.push(`Wrong pool NFT emission amount. Required: 1, actual: ${nft.emissionAmount}`)

      const requiredEmission = EmissionLP - BurnLP
      if (lp.emissionAmount != requiredEmission)
        errorsAcc.push(
          `Wrong pool LP emission amount. Required: ${requiredEmission}, actual: ${lp.emissionAmount}`
        )

      const poolTokensNum = 3
      if (genesisBox.assets.length === poolTokensNum) {
        const [nft0, lp0, y0] = genesisBox.assets
        if (nft0.amount !== 1n || nft0.tokenId !== pool.id) errorsAcc.push(`Wrong genesis NFT.`)
        const allowedLP = sqrt(genesisBox.value * y0.amount)
        const takenLP = requiredEmission - lp0.amount
        if (allowedLP < takenLP)
          errorsAcc.push(`Illegal pool initialization. Allowed LP: ${allowedLP}, taken: ${takenLP}`)
      } else {
        errorsAcc.push(
          `Wrong number of pool tokens. Required: ${poolTokensNum}, actual: ${genesisBox.assets.length}`
        )
      }
    }
    return errorsAcc.length > 0 ? errorsAcc : OK
  }
}

export class DefaultAmmPoolValidation implements PoolValidation<AmmPool> {
  private n2tValidation: N2TAmmPoolValidation
  private t2tValidation: T2TAmmPoolValidation

  constructor(public readonly network: ErgoNetwork) {
    this.n2tValidation = new N2TAmmPoolValidation(network)
    this.t2tValidation = new T2TAmmPoolValidation(network)
  }

  validate(pool: AmmPool): Promise<ValidationResult> {
    return isNative(pool.x.asset) ? this.n2tValidation.validate(pool) : this.t2tValidation.validate(pool)
  }
}
