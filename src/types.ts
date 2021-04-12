import {Asset} from "./entities/asset";
import {Constant} from "ergo-lib-wasm-browser";
import {HexString} from "./wallet/types";

export type TokenPair = { readonly x: Asset, readonly y: Asset }
export type Register = { readonly id: number, readonly value: Constant}

export type ErgoTreeHex = HexString
export type ErgoTreeTemplateHashHex = HexString
export type PublicKeyHex = HexString
