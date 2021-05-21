import {HexString} from "../wallet/types";

export function fromHex(s: HexString): Uint8Array {
    return Uint8Array.from(Buffer.from(s, 'hex'))
}