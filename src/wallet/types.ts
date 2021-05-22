import {AssetInfo} from "./entities/assetInfo";
import {Constant} from "./entities/constant";
import {RegisterId} from "./entities/registerId";

export type HexString = string
export type Base58String = string

export type TokenId = HexString
export type BoxId = HexString
export type TxId = HexString

export type ErgoTreeTemplateHash = HexString

export type MintToken = { token: AssetInfo, amount: bigint }

export type NErg = bigint
