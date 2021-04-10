import {Token} from "./entities/token";
import {Constant} from "ergo-lib-wasm-browser";

export type TokenPair = { readonly x: Token, readonly y: Token }
export type Register = { readonly id: number, readonly value: Constant}

export type HexString = string

export type ErgoTreeHex = HexString
export type ErgoTreeTemplateHashHex = HexString
export type PublicKeyHex = HexString
