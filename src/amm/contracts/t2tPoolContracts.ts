import {I64} from "ergo-lib-wasm-browser";
import {PoolId} from "../types";
import * as templates from "./templates";
import {HexString, NErg, TokenId} from "../../wallet/types";
import {ErgoTree} from "../../wallet/entities/ergoTree";
import {PublicKey} from "../../wallet/entities/publicKey";
import * as wasm from "ergo-lib-wasm-browser";
import {fromHex} from "../../utils/hex";

export class T2tPoolContracts {

    static poolBoot(emissionLP: bigint): ErgoTree {
        let tree = wasm.ErgoTree.from_base16_bytes(templates.T2tPool)
        tree.set_constant(7, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        tree.set_constant(8, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        return tree.to_base16_bytes()
    }

    static pool(emissionLP: bigint): ErgoTree {
        let tree = wasm.ErgoTree.from_base16_bytes(templates.T2tPoolBoot)
        tree.set_constant(6, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        tree.set_constant(14, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        return tree.to_base16_bytes()
    }

    static deposit(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let tree = wasm.ErgoTree.from_base16_bytes(templates.T2tDeposit)
        tree.set_constant(0, wasm.Constant.decode_from_base16(pk))
        tree.set_constant(5, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        tree.set_constant(8, wasm.Constant.from_byte_array(fromHex(poolId)))
        tree.set_constant(10, wasm.Constant.from_i64(I64.from_str(dexFee.toString())))
        return tree.to_base16_bytes()
    }

    static redeem(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let tree = wasm.ErgoTree.from_base16_bytes(templates.T2tRedeem)
        tree.set_constant(0, wasm.Constant.decode_from_base16(pk))
        tree.set_constant(7, wasm.Constant.from_i64(I64.from_str(emissionLP.toString())))
        tree.set_constant(10, wasm.Constant.from_byte_array(fromHex(poolId)))
        tree.set_constant(12, wasm.Constant.from_i64(I64.from_str(dexFee.toString())))
        return tree.to_base16_bytes()
    }

    static swap(
        poolScriptHash: HexString,
        poolFeeNum: number,
        quoteId: TokenId,
        minQuoteAmount: bigint,
        dexFeePerToken: NErg,
        pk: PublicKey
    ): ErgoTree {
        let tree = wasm.ErgoTree.from_base16_bytes(templates.T2tSwap)
        tree.set_constant(0, wasm.Constant.decode_from_base16(pk)) // todo: is that correct?
        tree.set_constant(3, wasm.Constant.from_byte_array(fromHex(quoteId)))
        tree.set_constant(8, wasm.Constant.from_i32(poolFeeNum))
        tree.set_constant(9, wasm.Constant.from_byte_array(fromHex(poolScriptHash)))
        tree.set_constant(11, wasm.Constant.from_i64(I64.from_str(minQuoteAmount.toString())))
        tree.set_constant(12, wasm.Constant.from_i64(I64.from_str(dexFeePerToken.toString())))
        return tree.to_base16_bytes()
    }
}