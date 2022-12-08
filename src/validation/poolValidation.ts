export const OK = "OK"

export type OK = typeof OK
export type ValidationErrors = string[]
export type ValidationResult = OK | ValidationErrors

export interface PoolValidation<TPool> {
  /** Check whether the given pool is properly initialized.
   */
  validate(pool: TPool): Promise<ValidationResult>
}
