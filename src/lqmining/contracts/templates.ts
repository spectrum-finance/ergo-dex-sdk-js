import {ErgoTreeTemplate, HexString, RustModule} from "@ergolabs/ergo-sdk"
import * as crypto from "crypto-js"
import {toHex} from "../../utils/hex"

export const StakingBundleSample: ErgoTreeTemplate =
  "198c031104000e2000000000000000000000000000000000000000000000000000000000000000" +
  "0004020e69aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0404040008cd03" +
  "d36d7e86b0fe7d8aec204f0ae6c2be6563fc7a443d69501d73dfe9c2adddb15a040005fcffffff" +
  "ffffffffff01040004060400040805f00d040205020404d808d601b2a4730000d602db63087201" +
  "d6037301d604b2a5730200d6057303d606c57201d607b2a5730400d6088cb2db6308a773050002" +
  "eb027306d1eded938cb27202730700017203ed93c27204720593860272067308b2db6308720473" +
  "0900edededed93e4c67207040e720593e4c67207050e72039386028cb27202730a00017208b2db" +
  "0900edededed93e4c67207040e720593e4c67207050e72039386028cb27202730a00017208b2db" +
  "b2db63087207731000"

export function stakingBundleTemplateHash(): HexString {
  const template = RustModule.SigmaRust.ErgoTree.from_base16_bytes(StakingBundleSample).template_bytes()
  return crypto.SHA256(crypto.enc.Hex.parse(toHex(template))).toString(crypto.enc.Hex)
}
