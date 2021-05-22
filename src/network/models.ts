import {ErgoBox as WalletBox} from "../wallet/entities/ergoBox";
import {Token as WalletToken} from "../wallet/entities/token";
import {ByteaConstant, Constant, Int32Constant, Int64Constant} from "../wallet/entities/constant";
import {fromHex} from "../utils/hex";
import {SigmaType} from "../wallet/entities/sigmaType";
import {RegisterId} from "../wallet/entities/registerId";

export type ErgoBox = {
    boxId: string,
    transactionId: string,
    blockId: string,
    value: bigint,
    index: number,
    creationHeight: number,
    settlementHeight: number,
    ergoTree: string,
    address: string,
    assets: BoxAsset[],
    additionalRegisters: Map<RegisterId, BoxRegister>,
    spentTransactionId?: string
}

export type BoxAsset = {
    tokenId: string,
    index: number,
    amount: bigint,
    name?: string,
    decimals?: number
}

export type BoxRegister = {
    serializedValue: string,
    sigmaType: SigmaType,
    renderedValue: string
}

export function toWalletConstant(reg: BoxRegister): Constant | undefined {
    switch (reg.sigmaType) {
        case "Coll[Byte]":
            return new ByteaConstant(fromHex(reg.renderedValue))
        case "SInt":
            return new Int32Constant(Number(reg.renderedValue))
        case "SLong":
            return new Int64Constant(BigInt(reg.renderedValue))
        default:
            return undefined
    }
}

export function toWalletToken(asset: BoxAsset): WalletToken {
    return new WalletToken(asset.tokenId, asset.amount, asset.name, asset.decimals)
}

export function toWalletErgoBox(box: ErgoBox): WalletBox {
    let registers = new Map<RegisterId, Constant>()
    box.additionalRegisters.forEach((v, k, _xs) => {
        let c = toWalletConstant(v)
        if (c) registers.set(k, c)
    })
    return new WalletBox(
        box.boxId,
        box.transactionId,
        box.index,
        box.ergoTree,
        box.creationHeight,
        box.value,
        box.assets.map((a, _ix, _xs) => toWalletToken(a)),
        registers
    )
}
