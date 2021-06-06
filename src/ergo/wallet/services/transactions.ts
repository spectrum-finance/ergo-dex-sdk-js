import {Address} from "../../entities/address"
import {TransactionContext} from "../entities/transactionContext"
import {ErgoTx} from "../../entities/ergoTx"
import {Prover} from "../prover"
import {TxAssembler} from "../txAssembler"
import {ergoTreeFromAddress} from "../../entities/ergoTree"

export interface Transactions {
  simple(amount: bigint, recipient: Address, ctx: TransactionContext): Promise<ErgoTx>
}

export class DefaultTransactions implements Transactions {
  constructor(public readonly prover: Prover, public readonly txAsm: TxAssembler) {}

  async simple(amount: bigint, recipient: Address, ctx: TransactionContext): Promise<ErgoTx> {
    const out = {
      value: Number(amount),
      ergoTree: ergoTreeFromAddress(recipient),
      creationHeight: ctx.network.height,
      assets: [],
      additionalRegisters: {}
    }
    const req = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [out],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    return this.prover.sign(this.txAsm.assemble(req, ctx.network))
  }
}
