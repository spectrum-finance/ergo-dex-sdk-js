import {ErgoBox} from "@ergolabs/ergo-sdk"

/** Used to convert `ErgoBox` to domain entity `TEntity`.
 */
export interface FromBox<TEntity> {
  /** Convert `ErgoBox` to domain entity `TEntity`.
   */
  from(box: ErgoBox): TEntity | undefined

  /** Convert an array of `ErgoBox` to an array of entities `TEntity`.
   */
  fromMany(boxes: ErgoBox[]): TEntity[]
}
