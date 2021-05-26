export class Int32Constant {
  constructor(public readonly value: number) {}
}

export class Int64Constant {
  constructor(public readonly value: bigint) {}
}

export class ByteaConstant {
  constructor(public readonly value: Uint8Array) {}
}

export type Constant = Int32Constant | Int64Constant | ByteaConstant;
