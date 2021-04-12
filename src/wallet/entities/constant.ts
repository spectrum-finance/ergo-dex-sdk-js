import {Constant as LibConstant, I64} from "ergo-lib-wasm-browser";

export class Int32Constant {
    readonly value: number

    constructor(value: number) {
        this.value = value
    }

    toErgoLib(): LibConstant {
        return LibConstant.from_i32(this.value)
    }
}

export class Int64Constant {
    readonly value: bigint

    constructor(value: bigint) {
        this.value = value
    }

    toErgoLib(): LibConstant {
        return LibConstant.from_i64(I64.from_str(this.value.toString()))
    }
}

export class ByteaConstant {
    readonly value: Uint8Array

    constructor(value: Uint8Array) {
        this.value = value
    }

    toErgoLib(): LibConstant {
        return LibConstant.from_byte_array(this.value)
    }
}

export type Constant = Int32Constant | Int64Constant | ByteaConstant
