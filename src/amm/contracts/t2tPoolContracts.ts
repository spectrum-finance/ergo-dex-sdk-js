import {PoolId} from "../types";
import * as templates from "./templates";
import {HexString, NErg, TokenId, ErgoTree, PublicKey} from "../../ergo";
import {fromHex, toHex} from "../../utils/hex";
import {Blake2b256} from "../../utils/blake2b256";
import {fromErgoTree} from "../../ergo/entities/ergoTreeTemplate";
import {RustModule} from "../../utils/rustLoader";

export class T2tPoolContracts {

    static poolBoot(emissionLP: bigint): ErgoTree {
        // todo:
        // let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tPoolBoot)
        // tree.set_constant(7, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        // tree.set_constant(8, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        // return tree.to_base16_bytes()
        emissionLP
        return "19a3030f0400040204020404040404060406058080a0f6f4acdbe01b058080a0f6f4acdbe01b050004d00f0400040005000500d81ad601b2a5730000d602e4c6a70405d603db63087201d604db6308a7d605b27203730100d606b27204730200d607b27203730300d608b27204730400d609b27203730500d60ab27204730600d60b9973078c720602d60c999973088c720502720bd60d8c720802d60e998c720702720dd60f91720e7309d6108c720a02d6117e721006d6127e720e06d613998c7209027210d6147e720d06d615730ad6167e721306d6177e720c06d6187e720b06d6199c72127218d61a9c72167218d1edededededed93c27201c2a793e4c672010405720292c17201c1a793b27203730b00b27204730c00938c7205018c720601ed938c7207018c720801938c7209018c720a019593720c730d95720f929c9c721172127e7202069c7ef07213069a9c72147e7215067e9c720e720206929c9c721472167e7202069c7ef0720e069a9c72117e7215067e9c721372020695ed720f917213730e907217a19d721972149d721a7211ed9272199c7217721492721a9c72177211"
    }

    static pool(emissionLP: bigint): ErgoTree {
        // todo:
        // let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tPool)
        // tree.set_constant(6, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        // tree.set_constant(14, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        // return tree.to_base16_bytes()
        emissionLP
        return "19a3030f0400040204020404040404060406058080a0f6f4acdbe01b058080a0f6f4acdbe01b050004d00f0400040005000500d81ad601b2a5730000d602e4c6a70405d603db63087201d604db6308a7d605b27203730100d606b27204730200d607b27203730300d608b27204730400d609b27203730500d60ab27204730600d60b9973078c720602d60c999973088c720502720bd60d8c720802d60e998c720702720dd60f91720e7309d6108c720a02d6117e721006d6127e720e06d613998c7209027210d6147e720d06d615730ad6167e721306d6177e720c06d6187e720b06d6199c72127218d61a9c72167218d1edededededed93c27201c2a793e4c672010405720292c17201c1a793b27203730b00b27204730c00938c7205018c720601ed938c7207018c720801938c7209018c720a019593720c730d95720f929c9c721172127e7202069c7ef07213069a9c72147e7215067e9c720e720206929c9c721472167e7202069c7ef0720e069a9c72117e7215067e9c721372020695ed720f917213730e907217a19d721972149d721a7211ed9272199c7217721492721a9c72177211"
    }

    static poolTemplateHash(emissionLP: bigint): HexString {
        return toHex(Blake2b256.hash(fromErgoTree(this.pool(emissionLP))))
    }

    static deposit(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tDeposit)
        tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk))
        tree.set_constant(5, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        tree.set_constant(8, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
        tree.set_constant(10, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString())))
        return tree.to_base16_bytes()
    }

    static redeem(emissionLP: bigint, poolId: PoolId, pk: PublicKey, dexFee: bigint): ErgoTree {
        let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tRedeem)
        tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk))
        tree.set_constant(7, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(emissionLP.toString())))
        tree.set_constant(10, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolId)))
        tree.set_constant(12, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFee.toString())))
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
        let tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(templates.T2tSwap)
        tree.set_constant(0, RustModule.SigmaRust.Constant.decode_from_base16(pk)) // todo: is that correct?
        tree.set_constant(3, RustModule.SigmaRust.Constant.from_byte_array(fromHex(quoteId)))
        tree.set_constant(8, RustModule.SigmaRust.Constant.from_i32(poolFeeNum))
        tree.set_constant(9, RustModule.SigmaRust.Constant.from_byte_array(fromHex(poolScriptHash)))
        tree.set_constant(11, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(minQuoteAmount.toString())))
        tree.set_constant(12, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(dexFeePerToken.toString())))
        return tree.to_base16_bytes()
    }
}
