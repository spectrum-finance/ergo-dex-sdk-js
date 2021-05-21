export class Int32Constant {
    readonly value: number

    constructor(value: number) {
        this.value = value
    }
}

export class Int64Constant {
    readonly value: bigint

    constructor(value: bigint) {
        this.value = value
    }
}

export class ByteaConstant {
    readonly value: Uint8Array

    constructor(value: Uint8Array) {
        this.value = value
    }
}

export type Constant = Int32Constant | Int64Constant | ByteaConstant
