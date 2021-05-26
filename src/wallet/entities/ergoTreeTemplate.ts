import { toHex } from '../../utils/hex';
import { RustModule } from '../../utils/rustLoader';
import { HexString } from '../types';

import { ErgoTree } from './ergoTree';

export type ErgoTreeTemplate = HexString;

export function fromErgoTree(tree: ErgoTree): ErgoTreeTemplate {
  // @ts-ignore
  return toHex(RustModule.SigmaRust.ErgoTree.from_base16_bytes(tree).template_bytes());
}
