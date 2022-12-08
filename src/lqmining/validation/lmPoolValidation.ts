import {notImplemented} from "../../utils/notImplemented"
import {PoolValidation, ValidationResult} from "../../validation/poolValidation"
import {LmPool} from "../entities/lmPool"

export class LmPoolValidation implements PoolValidation<LmPool> {
  validate(pool: LmPool): Promise<ValidationResult> {
    return notImplemented([pool])
  }
}
