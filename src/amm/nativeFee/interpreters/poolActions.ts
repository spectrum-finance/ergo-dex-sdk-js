import {Address, ErgoTx, isNative, Prover, TxAssembler, TxRequest} from "@ergolabs/ergo-sdk"
import {NativeExFeeType} from "../../../types"
import {N2tPoolSetupAction} from "../../common/interpreters/n2tPoolSetupAction"
import {PoolActionsSelector, wrapPoolActions} from "../../common/interpreters/poolActions"
import {T2tPoolSetupAction} from "../../common/interpreters/t2tPoolSetupAction"
import {N2tPoolActions} from "./n2tPoolActions"
import {T2tPoolActions} from "./t2tPoolActions"

export function makeNativePoolActionsSelector(
  uiRewardAddress: Address
): PoolActionsSelector<TxRequest, NativeExFeeType> {
  return pool =>
    isNative(pool.x.asset) || isNative(pool.y.asset)
      ? new N2tPoolActions(uiRewardAddress, new N2tPoolSetupAction())
      : new T2tPoolActions(uiRewardAddress, new T2tPoolSetupAction())
}

export function makeWrappedNativePoolActionsSelector(
  uiRewardAddress: Address,
  prover: Prover,
  txAsm: TxAssembler
): PoolActionsSelector<ErgoTx, NativeExFeeType> {
  return pool =>
    wrapPoolActions(
      isNative(pool.x.asset) || isNative(pool.y.asset)
        ? new N2tPoolActions(uiRewardAddress, new N2tPoolSetupAction())
        : new T2tPoolActions(uiRewardAddress, new T2tPoolSetupAction()),
      prover,
      txAsm
    )
}
