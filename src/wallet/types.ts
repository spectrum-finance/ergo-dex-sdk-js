import {Eip4Token} from "../entities/eip4Token";

export type HexString = string

export type PublicKey = HexString

export type TokenId = HexString
export type BoxId = HexString
export type TxId = HexString

export type MintToken = { token: Eip4Token, amount: bigint }
