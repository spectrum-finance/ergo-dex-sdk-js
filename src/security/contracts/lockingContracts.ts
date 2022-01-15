import {ErgoTree} from "@ergolabs/ergo-sdk"
import {SigmaRust} from "@ergolabs/ergo-sdk/build/main/utils/rustLoader"
import {TokenLockSample} from "./lockingTemplates"

export function tokenLock(R: SigmaRust): ErgoTree {
  return R.ErgoTree.from_base16_bytes(TokenLockSample).to_base16_bytes()
}
