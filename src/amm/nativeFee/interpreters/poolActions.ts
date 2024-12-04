import {Address, ErgoTx, isNative, Prover, TxAssembler, TxRequest} from "@ergolabs/ergo-sdk"
import {NativeExFeeType} from "../../../types"
import {N2tPoolSetupAction} from "../../common/interpreters/n2tPoolSetupAction"
import {N2dexyPoolSetupAction} from "../../common/interpreters/n2dexyPoolSetupAction"
import {PoolActionsSelector, wrapPoolActions} from "../../common/interpreters/poolActions"
import {T2tPoolSetupAction} from "../../common/interpreters/t2tPoolSetupAction"
import {isDexy} from "../contracts/n2dexyPoolContracts"
import {N2DexyPoolActions} from "./n2DexyPoolActions"
import {N2tPoolActions} from "./n2tPoolActions"
import {T2tPoolActions} from "./t2tPoolActions"

export function makeNativePoolActionsSelector(
  uiRewardAddress: Address
): PoolActionsSelector<TxRequest, NativeExFeeType> {
  return pool =>
    isDexy(pool.y.asset)
      ? new N2DexyPoolActions(uiRewardAddress, new N2dexyPoolSetupAction())
      : isNative(pool.x.asset) || isNative(pool.y.asset)
        ? new N2tPoolActions(uiRewardAddress, new N2tPoolSetupAction())
        : new T2tPoolActions(uiRewardAddress, new T2tPoolSetupAction());
}

export function makeWrappedNativePoolActionsSelector(
  uiRewardAddress: Address,
  prover: Prover,
  txAsm: TxAssembler
): PoolActionsSelector<ErgoTx, NativeExFeeType> {
  return pool => {
    const poolAction = isDexy(pool.y.asset)
      ? new N2DexyPoolActions(uiRewardAddress, new N2dexyPoolSetupAction())
      : isNative(pool.x.asset) || isNative(pool.y.asset)
        ? new N2tPoolActions(uiRewardAddress, new N2tPoolSetupAction())
        : new T2tPoolActions(uiRewardAddress, new T2tPoolSetupAction());
    return wrapPoolActions(
      poolAction,
      prover,
      txAsm
    )
  }
}
