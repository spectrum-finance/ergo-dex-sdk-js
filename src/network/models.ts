import {BoxId, HexString, Registers, SigmaType, TokenId} from "../ergo"
import {parseRegisterId} from "../ergo/entities/registers"
import * as wallet from "../ergo"

export type Items<T> = {
  items: T[]
  total: number
}

export type ErgoBox = {
  boxId: string
  transactionId: string
  blockId: string
  value: bigint
  index: number
  creationHeight: number
  settlementHeight: number
  ergoTree: string
  address: string
  assets: BoxAsset[]
  additionalRegisters: {[key: string]: BoxRegister}
  spentTransactionId?: string
}

export function fixErgoBox(box: ErgoBox): ErgoBox {
  return {...box, value: BigInt(box.value), assets: box.assets.map(a => fixBoxAsset(a))}
}

export type FullAssetInfo = {
  readonly id: TokenId
  readonly boxId: BoxId
  readonly emissionAmount: bigint
  readonly name?: string
  readonly decimals?: number
  readonly description?: string
}

export type BoxAsset = {
  tokenId: string
  index: number
  amount: bigint
  name?: string
  decimals?: number
}

export function fixBoxAsset(asset: BoxAsset): BoxAsset {
  return {...asset, amount: BigInt(asset.amount)}
}

export type BoxRegister = {
  serializedValue: string
  sigmaType: SigmaType
  renderedValue: string
}

export type BoxSearch = {
  ergoTreeTemplateHash: HexString
  assets: TokenId[]
}

export type BoxAssetsSearch = {
  ergoTreeTemplateHash: HexString
  assets: TokenId[]
}

export function toWalletToken(asset: BoxAsset): wallet.TokenAmount {
  return {
    tokenId: asset.tokenId,
    amount: asset.amount,
    name: asset.name,
    decimals: asset.decimals
  }
}

export function toWalletErgoBox(box: ErgoBox): wallet.ErgoBox {
  let registers: Registers = {}
  Object.entries(box.additionalRegisters).forEach(([k, v], _ix, _xs) => {
    let regId = parseRegisterId(k)
    if (regId) registers[regId] = v.serializedValue
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
