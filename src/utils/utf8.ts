export function stringToBytea(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s))
}
