import {ErgoNetwork} from "../../services/ergoNetwork"
import {AmmPool} from "../entities/ammPool"
import {BurnLP, EmissionLP} from "../constants"

export const OK = "OK"

export type OK = typeof OK
export type ValidationErrors = string[]
export type ValidationResult = OK | ValidationErrors

export interface AmmPoolValidation {
  /** Check whether the given pool is properly initialized.
   */
  validate(pool: AmmPool): Promise<ValidationResult>
}

export class NetworkAmmPoolValidation implements AmmPoolValidation {
  constructor(public readonly network: ErgoNetwork) {}

  async validate(pool: AmmPool): Promise<ValidationResult> {
    const nft = await this.network.getFullTokenInfo(pool.id)
    const lp = await this.network.getFullTokenInfo(pool.lp.asset.id)
    const poolBoxes = await this.network.getUnspentByTokenId(pool.id, {offset: 0, limit: 1})
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
        if (nft0.amount !== 1 || nft0.tokenId !== pool.id) errorsAcc.push(`Wrong genesis NFT.`)
        const allowedLP = Math.sqrt(x0.amount * y0.amount)
        const takenLP = Number(requiredEmission) - lp0.amount
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
