import {TxRequest} from "./entities/txRequest"
import {UnsignedErgoTx} from "../entities/unsignedErgoTx"
import {NetworkContext} from "../entities/networkContext"
import {txRequestToWasmTransaction} from "../ergoWasmInterop"

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
    //         creationHeight: ctx.height,
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
    return {
      ...tx.to_json(),
      id: tx.id().to_str(),
      inputs: req.inputs.unsignedInputs
    }
  }
}
