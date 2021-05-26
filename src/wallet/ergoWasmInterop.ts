import type {
  Constant,
  BoxSelection as wasmBoxSelection,
  ErgoBox as wasmErgoBox,
  ErgoBoxCandidates as wasmErgoBoxCandidates,
  ErgoTree as wasmErgoTree,
  Token as wasmToken,
  Tokens as wasmTokens,
} from 'ergo-lib-wasm-browser';

import { RustModule } from '../utils/rustLoader';

import { BoxSelection } from './entities/boxSelection';
import { Int32Constant, Int64Constant } from './entities/constant';
import { ErgoBox } from './entities/ergoBox';
import { ErgoBoxCandidate } from './entities/ergoBoxCandidate';
import { ErgoTree, ergoTreeToBytea } from './entities/ergoTree';
import { RegisterId } from './entities/registers';
import { TokenAmount } from './entities/tokenAmount';

export async function boxSelectionToWasm(inputs: BoxSelection): Promise<wasmBoxSelection> {
  const boxes = new RustModule.SigmaRust.ErgoBoxes(await boxToWasm(inputs.inputs[0]));
  const tokens = new RustModule.SigmaRust.Tokens();
  const changeList = new RustModule.SigmaRust.ErgoBoxAssetsDataList();
  if (inputs.change) {
    inputs.change.tokens.forEach((v, k, _xs) => {
      const t = new RustModule.SigmaRust.Token(
        RustModule.SigmaRust.TokenId.from_str(k),
        RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(v.toString()))
      );
      tokens.add(t);
    });
    const change = new RustModule.SigmaRust.ErgoBoxAssetsData(
      RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str(inputs.change.value.toString())),
      tokens
    );
    for (const box of inputs.inputs.slice(1)) boxes.add(await boxToWasm(box));
    changeList.add(change);
  }
  return new RustModule.SigmaRust.BoxSelection(boxes, changeList);
}

export async function boxCandidatesToWasm(
  boxes: ErgoBoxCandidate[]
): Promise<wasmErgoBoxCandidates> {
  const candidates = RustModule.SigmaRust.ErgoBoxCandidates.empty();
  for (const box of boxes) {
    // @ts-ignore
    candidates.add(await boxCandidateToWasm(box));
  }
  return candidates;
}

export async function boxCandidateToWasm(
  box: ErgoBoxCandidate
): Promise<wasmErgoBoxCandidates> {
  const value = RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str(box.value.toString()));
  const contract = RustModule.SigmaRust.Contract.pay_to_address(
    RustModule.SigmaRust.Address.recreate_from_ergo_tree(await ergoTreeToWasm(box.ergoTree))
  );
  const builder = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
    value,
    contract,
    box.creationHeight
  );
  for (const token of box.assets) {
    const t = await tokenToWasm(token);
    builder.add_token(t.id(), t.amount());
  }
  for (const [id, value] of box.additionalRegisters) {
    let constant: Constant;
    if (value instanceof Int32Constant)
      constant = RustModule.SigmaRust.Constant.from_i32(value.value);
    else if (value instanceof Int64Constant)
      constant = RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str(value.value.toString()));
    else constant = RustModule.SigmaRust.Constant.from_byte_array(value.value);
    builder.set_register_value(registerIdToWasm(id), constant);
  }
  // @ts-ignore
  return builder.build();
}

export function registerIdToWasm(id: RegisterId): number {
  return Number(id[1]);
}

export async function boxToWasm(box: ErgoBox): Promise<wasmErgoBox> {
  const value = RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str(box.value.toString()));
  const contract = RustModule.SigmaRust.Contract.pay_to_address(
    RustModule.SigmaRust.Address.recreate_from_ergo_tree(await ergoTreeToWasm(box.ergoTree))
  );
  const txId = RustModule.SigmaRust.TxId.from_str(box.transactionId);
  const tokens = await tokensToWasm(box.assets);
  return new RustModule.SigmaRust.ErgoBox(
    value,
    box.creationHeight,
    contract,
    txId,
    box.index,
    tokens
  );
}

export async function ergoTreeToWasm(tree: ErgoTree): Promise<wasmErgoTree> {
  return RustModule.SigmaRust.ErgoTree.from_bytes(await ergoTreeToBytea(tree));
}

export async function tokenToWasm(token: TokenAmount): Promise<wasmToken> {
  const id = RustModule.SigmaRust.TokenId.from_str(token.tokenId);
  const amount = RustModule.SigmaRust.TokenAmount.from_i64(
    RustModule.SigmaRust.I64.from_str(token.amount.toString())
  );
  return new RustModule.SigmaRust.Token(id, amount);
}

export async function tokensToWasm(tokens: TokenAmount[]): Promise<wasmTokens> {
  const bf = new RustModule.SigmaRust.Tokens();
  for (const t of tokens) bf.add(await tokenToWasm(t));
  return bf;
}
