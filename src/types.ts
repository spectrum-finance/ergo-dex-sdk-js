import {Eip4Token} from "./entities/eip4Token";
import {HexString} from "./wallet/types";
import {Constant} from "./wallet/entities/constant";

export type TokenPair = { readonly x: Eip4Token, readonly y: Eip4Token }
export type Register = { readonly id: number, readonly value: Constant}

export type ErgoTreeHex = HexString
export type ErgoTreeTemplateHashHex = HexString
