// @ts-ignore
import blake from 'blakejs';

export class Blake2b256 {

    static hash(input: Uint8Array): Uint8Array {
        return blake.blake2b(input, null, 32)
    }
}