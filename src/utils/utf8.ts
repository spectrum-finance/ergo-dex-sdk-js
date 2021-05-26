import { TextEncoder } from 'util';

export function stringToBytea(s: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(s);
}
