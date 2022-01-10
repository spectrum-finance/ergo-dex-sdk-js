import {
  ErgoTx,
  InsufficientInputs, Int32Constant,
  MinBoxValue,
  Prover,
  RegisterId,
  registers,
  SigmaPropConstant,
  TransactionContext,
  TxAssembler
} from "@ergolabs/ergo-sdk"
import {SigmaRust} from "@ergolabs/ergo-sdk/build/main/utils/rustLoader"
import {tokenLock} from "../contracts/lockingContracts"
import {LockParams} from "../models/lockParams"

export interface LockActions {
  lockTokens(params: LockParams, ctx: TransactionContext): Promise<ErgoTx>
}

export function mkLockActions(prover: Prover, txAsm: TxAssembler, R: SigmaRust): LockActions {
  return new ErgoTokensLockActions(prover, txAsm, R)
}

class ErgoTokensLockActions implements LockActions {
  constructor(
    public readonly prover: Prover,
    public readonly txAsm: TxAssembler,
    public readonly R: SigmaRust
  ) {}

  lockTokens(params: LockParams, ctx: TransactionContext): Promise<ErgoTx> {
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const lockScript = tokenLock(this.R)
    const lockOutput = {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: lockScript,
      creationHeight: ctx.network.height,
      assets: outputGranted.assets,
      additionalRegisters: registers([
        [RegisterId.R4, new Int32Constant(params.duration)],
        [RegisterId.R5, new SigmaPropConstant(params.pk)]
      ])
    }
    const txr = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [lockOutput],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }

    const minNErgs = ctx.feeNErgs + MinBoxValue
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    else
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
  }
}
