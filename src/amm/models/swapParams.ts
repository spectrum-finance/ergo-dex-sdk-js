import { AssetAmount, PublicKey } from '../../wallet';
import { HexString, NErg, TokenId } from '../../wallet/types';

export type SwapParams = {
  readonly pk: PublicKey;
  readonly poolScriptHash: HexString;
  readonly poolFeeNum: number;
  readonly baseInput: AssetAmount;
  readonly quoteAsset: TokenId;
  readonly minQuoteOutput: bigint;
  readonly dexFeePerToken: NErg;
};
