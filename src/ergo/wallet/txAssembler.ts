import {TxRequest} from "./entities/txRequest"
import {UnsignedErgoTx} from "../entities/unsignedErgoTx"
import {NetworkContext} from "../entities/networkContext"
import {ergoTreeFromAddress} from "../entities/ergoTree"
import {EmptyRegisters} from "../entities/registers"
import {MinerAddressMainnet, MinerAddressTestnet} from "../constants"
import {boxCandidateToWasmBox} from "../ergoWasmInterop"

export interface TxAssembler {
  assemble(req: TxRequest, ctx: NetworkContext): UnsignedErgoTx
}

export class DefaultTxAssembler implements TxAssembler {
  constructor(public readonly mainnet: boolean) {}

  assemble(req: TxRequest, ctx: NetworkContext): UnsignedErgoTx {
    let change = req.inputs.change
    let changeBox = change
      ? [
          {
            value: change.value,
            ergoTree: ergoTreeFromAddress(req.changeAddress),
            creationHeight: ctx.height,
            assets: change.assets,
            additionalRegisters: EmptyRegisters
          }
        ]
      : []
    let feeBox = req.feeNErgs
      ? [
          {
            value: Number(req.feeNErgs),
            ergoTree: ergoTreeFromAddress(this.mainnet ? MinerAddressMainnet : MinerAddressTestnet),
            creationHeight: ctx.height,
            assets: [],
            additionalRegisters: EmptyRegisters
          }
        ]
      : []
    let outputs = [...req.outputs, ...changeBox, ...feeBox]
    const dummyTxId = "026fb3ec6303a7b64fc947df86b84b3ef78c6693c1990c52ea56037c50b674c0"
    return {
      id: dummyTxId,
      inputs: req.inputs.unsignedInputs,
      dataInputs: req.dataInputs,
      outputs: outputs.map((out, ix, _xs) => JSON.parse(boxCandidateToWasmBox(out, dummyTxId, ix).to_json()))
    }
  }
}
