import {RustModule} from "@ergolabs/ergo-sdk"
import {
  ErgoTreePrefixHex,
  SigmaFalseHex,
  SigmaPropConstPrefixHex,
  SigmaTrueHex
} from "../amm/common/constants"
import {fromHex} from "./hex"

interface ConstantContract {
  serialize: () => any
}

export class _Int implements ConstantContract {
  readonly _INT: unknown

  constructor(public readonly value: number) {}

  serialize() {
    return RustModule.SigmaRust.Constant.from_i32(this.value)
  }
}

export class _Long {
  readonly _LONG: unknown

  constructor(public readonly value: bigint) {}

  serialize() {
    return RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(this.value.toString()))
  }
}

export class _Bool {
  readonly _BOOL: unknown

  constructor(public readonly value: boolean) {}

  serialize() {
    return RustModule.SigmaRust.Constant.decode_from_base16(this.value ? SigmaTrueHex : SigmaFalseHex)
  }
}

export class _ProveDlog {
  readonly _PROVE_DLOG: unknown

  constructor(public readonly value: string) {}

  serialize() {
    return RustModule.SigmaRust.Constant.decode_from_base16(SigmaPropConstPrefixHex + this.value)
  }
}

export class _RedeemerBytes {
  readonly _REDEEMER_BYTES: unknown

  constructor(public readonly value: string) {}

  serialize() {
    return RustModule.SigmaRust.Constant.from_byte_array(
      fromHex(ErgoTreePrefixHex + SigmaPropConstPrefixHex + this.value)
    )
  }
}

export class _Bytes {
  readonly _BYTES: unknown

  constructor(public readonly value: string) {}

  serialize() {
    return RustModule.SigmaRust.Constant.from_byte_array(fromHex(this.value))
  }
}

export const Int = (value: number) => new _Int(value)

export const Long = (value: bigint) => new _Long(value)

export const Bool = (value: boolean) => new _Bool(value)

export const ProveDlog = (value: string) => new _ProveDlog(value)

export const RedeemerBytes = (value: string) => new _RedeemerBytes(value)

export const Bytes = (value: string) => new _Bytes(value)

export const Constants = {
  Int,
  Long,
  Bool,
  ProveDlog,
  RedeemerBytes,
  Bytes
}

type Constant = _Int | _Long | _Bool | _ProveDlog | _RedeemerBytes | _Bytes

type ConstantDictionary = {[key: string]: Constant}

type ContractMapping<T extends {[key: string]: Constant}> = {
  [key in keyof T]: [number, (...args: any[]) => T[key]]
}

export class _Contract<T extends ConstantDictionary> {
  constructor(private ergoTreeSample: string, private mapping: ContractMapping<T>) {}

  build(data: T): string {
    return Object.entries(data)
      .reduce((ergoTree, [constantName, constantValue]) => {
        try {
          return ergoTree.with_constant(this.mapping[constantName][0], constantValue.serialize())
        } catch (e) {
          console.error(`problem with constant ${constantName}`)
          console.log(e)
          throw e
        }
      }, RustModule.SigmaRust.ErgoTree.from_base16_bytes(this.ergoTreeSample))
      .to_base16_bytes()
  }
}

export const Contract = <T extends ConstantDictionary>(
  ergoTreeSample: string,
  mapping: ContractMapping<T>
): _Contract<T> => new _Contract(ergoTreeSample, mapping)
