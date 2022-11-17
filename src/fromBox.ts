import {ErgoBox} from "@ergolabs/ergo-sdk"

export interface FromBox<Entity> {
  /** Convert `ErgoBox` to some domain `Entity`.
   */
  from(box: ErgoBox): Entity | undefined

  /** Convert an array of `ErgoBox` to an array of `Entity`.
   */
  fromMany(boxes: ErgoBox[]): Entity[]
}
