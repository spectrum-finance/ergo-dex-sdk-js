import {AssetAmount, PublicKey, TokenId} from "@ergolabs/ergo-sdk"
import {NetworkContext} from "@ergolabs/ergo-sdk/build/main/entities/networkContext"
import {ExFee, ExFeePerToken, ExFeeType} from "../../../types"
import {PoolId} from "../types"

export type SwapParams<F extends ExFeeType> = {
  readonly pk: PublicKey
  readonly poolId: PoolId
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: TokenId
  readonly minQuoteOutput: bigint
  readonly exFeePerToken: ExFeePerToken<F>
  readonly maxExFee: ExFee<F>;
  readonly uiFee: bigint
}

export interface SwapParamsV2 {
  readonly address: string;
  readonly pk: PublicKey;
  readonly baseInput: AssetAmount;
  readonly slippage: number;
  readonly nitro: number;
  readonly minExFee: bigint;
  readonly minerFee: bigint;
  readonly network: NetworkContext;
}
