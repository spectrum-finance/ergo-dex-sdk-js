import { RustModule } from '../../utils/rustLoader';


import { HexString } from '../types';

import { Address } from './address';

export type ErgoTree = HexString;

export async function ergoTreeFromAddress(addr: Address): Promise<ErgoTree> {
  await RustModule.load();
  return RustModule.SigmaRust.Address.from_base58(addr).to_ergo_tree().to_base16_bytes();
}

export async function ergoTreeToBytea(ergoTree: ErgoTree): Promise<Uint8Array> {
  await RustModule.load();
  return RustModule.SigmaRust.ErgoTree.from_base16_bytes(ergoTree).to_bytes();
}
