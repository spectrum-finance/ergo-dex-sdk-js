import { TokenId } from '../types';

export type ChangeBox = {
  readonly value: bigint;
  readonly tokens: Map<TokenId, bigint>;
};
