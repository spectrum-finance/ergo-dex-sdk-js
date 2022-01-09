import {ErgoTree, PublicKey} from "@ergolabs/ergo-sdk"
import {SigmaRust} from "@ergolabs/ergo-sdk/build/main/utils/rustLoader"
import {SigmaPropConstPrefixHex} from "../../amm/constants"
import {TokenLockSample} from "./lockingTemplates"

export function tokenLock(pk: PublicKey, duration: number, R: SigmaRust): ErgoTree {
  return R.ErgoTree.from_base16_bytes(TokenLockSample)
    .with_constant(0, R.Constant.decode_from_base16(SigmaPropConstPrefixHex + pk))
    .with_constant(1, R.Constant.from_i32(duration))
    .to_base16_bytes()
}
