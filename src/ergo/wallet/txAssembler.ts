import {TxRequest} from "./entities/txRequest"
import {UnsignedErgoTx} from "../entities/unsignedErgoTx"
import {NetworkContext} from "../entities/networkContext"
import { boxCandidateToWasmBox, txRequestToWasmTransaction } from "../ergoWasmInterop"
import { ErgoBoxCandidate } from "../entities/ergoBoxCandidate"

export interface TxAssembler {
  assemble(req: TxRequest, ctx: NetworkContext): UnsignedErgoTx
}

export class DefaultTxAssembler implements TxAssembler {
  constructor(public readonly mainnet: boolean) {}

  assemble(req: TxRequest, ctx: NetworkContext): UnsignedErgoTx {
    // let change = req.inputs.change
    // let changeBox = change
    //   ? [
    //       {
    //         value: change.value,
    //         ergoTree: ergoTreeFromAddress(req.changeAddress),
    //         creationHeight: ctx.height,
    //         assets: change.assets,
    //         additionalRegisters: EmptyRegisters
    //       }
    //     ]
    //   : []
    // let feeBox = req.feeNErgs
    //   ? [
    //       {
    //         value: Number(req.feeNErgs),
    //         ergoTree: ergoTreeFromAddress(this.mainnet ? MinerAddressMainnet : MinerAddressTestnet),
    //         creationHeight : ctx.height,
    //         assets: [],
    //         additionalRegisters: EmptyRegisters
    //       }
    //     ]
    //   : []
    // let outputs = [...req.outputs, ...changeBox, ...feeBox]
    // return  {
    //   inputs: req.inputs.unsignedInputs,
    //   dataInputs: req.dataInputs,
    //   outputs: outputs
    // }
    const tx = txRequestToWasmTransaction(req, ctx)
    const txJson = tx.to_json()
    return {
      ...txJson,
      id: tx.id().to_str(),
      inputs: req.inputs.unsignedInputs,
      outputs: (txJson["outputs"] as ErgoBoxCandidate[]).map((out, ix, _xs) => boxCandidateToWasmBox(out, tx.id().to_str(), ix).to_json())
    }
  }
}
