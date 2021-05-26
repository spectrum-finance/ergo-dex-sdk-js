import { EmptyInputs } from '../errors/emptyInputs';
import { TokenId } from '../types';

import { ChangeBox } from './changeBox';
import { ErgoBox } from './ergoBox';
import { OverallAmount } from './overallAmount';
import { TokenAmount } from './tokenAmount';

export class BoxSelection {
  private constructor(
    public readonly inputs: ErgoBox[],
    public readonly change?: ChangeBox
  ) {}

  static make(
    inputs: ErgoBox[],
    change?: ChangeBox
  ): BoxSelection | EmptyInputs {
    return inputs.length > 0
      ? new BoxSelection(inputs, change)
      : new EmptyInputs();
  }

  static safe(
    head: ErgoBox,
    others?: ErgoBox[],
    change?: ChangeBox
  ): BoxSelection {
    return new BoxSelection([head].concat(others || []), change);
  }

  get newTokenId(): TokenId {
    return this.inputs[0].boxId;
  }

  /** Amounts of all kinds of tokens with change excluded.
   */
  get totalOutputWithoutChange(): OverallAmount {
    const nErgsIn = this.inputs
      .map((bx, _i, _xs) => bx.value)
      .reduce((x, y, _i, _xs) => x + y);
    const nErgsChange = this.change?.value || 0n;
    const tokensChange = this.change?.tokens || new Map<TokenId, bigint>();
    const nErgs = nErgsIn - nErgsChange;
    const tokensAgg = new Map<TokenId, bigint>();
    for (const t of this.inputs.flatMap((bx, _i, _xs) => bx.assets)) {
      const acc = tokensAgg.get(t.tokenId) || 0n;
      tokensAgg.set(t.tokenId, t.amount + acc);
    }
    for (const [id, amount] of tokensChange) {
      const amountIn = tokensAgg.get(id);
      if (amountIn) tokensAgg.set(id, amountIn - amount);
    }
    const tokens: TokenAmount[] = [];
    tokensAgg.forEach((amount, tokenId, _xs) =>
      tokens.push({ tokenId, amount })
    );
    return { nErgs, tokens };
  }
}
