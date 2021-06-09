import { Address } from "../../entities/address"
import { TransactionContext } from "../entities/transactionContext"
import { ErgoTx } from "../../entities/ergoTx"
import { Prover } from "../prover"
import { TxAssembler } from "../txAssembler"
import { ergoTreeFromAddress } from "../../entities/ergoTree"
import { TokenAmount } from "../../entities/tokenAmount"

export interface Transactions {
  simple(amount: bigint, tokens: TokenAmount[], recipient: Address, ctx: TransactionContext): Promise<ErgoTx>
}

export class DefaultTransactions implements Transactions {
  constructor(public readonly prover: Prover, public readonly txAsm: TxAssembler) {
  }

  async simple(amount: bigint, assets: TokenAmount[], recipient: Address, ctx: TransactionContext): Promise<ErgoTx> {
    const out = {
      value: Number(amount),
      ergoTree: ergoTreeFromAddress(recipient),
      creationHeight: ctx.network.height,
      assets: assets,
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
