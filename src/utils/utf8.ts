export function stringToBytea(s: string): Uint8Array {
    let encoder = new TextEncoder()
    return encoder.encode(s)
}