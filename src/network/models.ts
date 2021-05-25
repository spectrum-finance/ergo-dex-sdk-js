import {ByteaConstant, Constant, Int32Constant, Int64Constant} from "../ergo/entities/constant";
import {fromHex} from "../utils/hex";
import {RegisterId} from "../ergo/entities/registers";
import * as wallet from "../ergo";
import {SigmaType} from "../ergo";

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

export function toWalletConstant(reg: BoxRegister): wallet.Constant | undefined {
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

export function toWalletToken(asset: BoxAsset): wallet.TokenAmount {
    return {tokenId: asset.tokenId, amount: asset.amount, name: asset.name, decimals: asset.decimals}
}

export function toWalletErgoBox(box: ErgoBox): wallet.ErgoBox {
    let registers = new Map<RegisterId, Constant>()
    box.additionalRegisters.forEach((v, k, _xs) => {
        let c = toWalletConstant(v)
        if (c) registers.set(k, c)
    })
    return {
        boxId: box.boxId,
        transactionId: box.transactionId,
        index: box.index,
        ergoTree: box.ergoTree,
        creationHeight: box.creationHeight,
        value: box.value,
        assets: box.assets.map((a, _ix, _xs) => toWalletToken(a)),
        additionalRegisters: registers
    }
}
