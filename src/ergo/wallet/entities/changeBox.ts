import {TokenAmount} from "../../entities/tokenAmount"

export type ChangeBox = {
  readonly value: number
  readonly assets: TokenAmount[]
}
