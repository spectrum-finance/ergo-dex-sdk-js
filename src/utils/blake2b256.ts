// @ts-ignore
import blake from "blakejs"
import {HexString} from "@ergolabs/ergo-sdk"

export class Blake2b256 {
  static hash(input: Uint8Array | HexString): Uint8Array {
    return blake.blake2b(input, undefined, 32)
  }
}
