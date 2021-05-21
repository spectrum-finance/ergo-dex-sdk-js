export class NetworkContext {
    readonly height: number
    readonly nErgsPerByte: bigint

    constructor(height: number, nErgsPerByte: bigint) {
        this.height = height
        this.nErgsPerByte = nErgsPerByte
    }
}