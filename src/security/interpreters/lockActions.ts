import {
  BoxSelection,
  EmptyRegisters,
  ErgoNetwork,
  ergoTreeFromAddress,
  ErgoTx,
  InsufficientInputs,
  Int32Constant,
  MinBoxValue,
  MinTransactionContext,
  Prover,
  RegisterId,
  registers,
  SigmaPropConstant,
  TransactionContext,
  TxAssembler
} from "@ergolabs/ergo-sdk"
import {SigmaRust} from "@ergolabs/ergo-sdk/build/main/utils/rustLoader"
import {tokenLock} from "../contracts/lockingContracts"
import {LockParams, RelockParams, WithdrawalParams} from "../models"
import {LockParser} from "../parsers/lockParser"

export interface LockActions {
  lockTokens(params: LockParams, ctx: TransactionContext): Promise<ErgoTx>

  withdrawTokens(params: WithdrawalParams, ctx: MinTransactionContext): Promise<ErgoTx>

  relockTokens(params: RelockParams, ctx: TransactionContext): Promise<ErgoTx>
}

export function mkLockActions(
  network: ErgoNetwork,
  parser: LockParser,
  prover: Prover,
  txAsm: TxAssembler,
  R: SigmaRust
): LockActions {
  return new ErgoTokensLockActions(network, parser, prover, txAsm, R)
}

class ErgoTokensLockActions implements LockActions {
  constructor(
    public readonly network: ErgoNetwork,
    public readonly parser: LockParser,
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
        [RegisterId.R4, new Int32Constant(params.deadline)],
        [RegisterId.R5, new SigmaPropConstant(params.redeemer)]
      ])
    }
    const txr = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [lockOutput],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }

    const minNErgs = ctx.feeNErgs * 2n + MinBoxValue
    if (outputGranted.nErgs < minNErgs)
      return Promise.reject(
        new InsufficientInputs(`Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`)
      )
    else return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
  }

  async withdrawTokens(params: WithdrawalParams, ctx: MinTransactionContext): Promise<ErgoTx> {
    const lockBox = await this.network.getOutput(params.boxId)
    if (lockBox) {
      const redeemerOutput = {
        value: lockBox.value - ctx.feeNErgs,
        ergoTree: ergoTreeFromAddress(params.address),
        creationHeight: ctx.network.height,
        assets: lockBox.assets,
        additionalRegisters: EmptyRegisters
      }
      const txr = {
        inputs: BoxSelection.safe(lockBox),
        dataInputs: [],
        outputs: [redeemerOutput],
        changeAddress: params.address,
        feeNErgs: ctx.feeNErgs
      }
      return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
    } else {
      return Promise.reject(new InsufficientInputs(`Output{id='${params.boxId}'} not found`))
    }
  }

  async relockTokens(params: RelockParams, ctx: TransactionContext): Promise<ErgoTx> {
    const lockBox = await this.network.getOutput(params.boxId)
    if (lockBox) {
      const lock = this.parser.parseTokenLock(lockBox)
      if (lock) {
        const updatedInputs = ctx.inputs.addInput(lockBox)
        const outputGranted = updatedInputs.totalOutputWithoutChange
        const relockOutput = {
          value: outputGranted.nErgs - ctx.feeNErgs,
          ergoTree: lockBox.ergoTree,
          creationHeight: ctx.network.height,
          assets: lockBox.assets,
          additionalRegisters: registers([
            [RegisterId.R4, new Int32Constant(params.updateDeadline ? params.updateDeadline : lock.deadline)],
            [
              RegisterId.R5,
              new SigmaPropConstant(params.updateRedeemer ? params.updateRedeemer : lock.redeemer)
            ]
          ])
        }
        const txr = {
          inputs: updatedInputs,
          dataInputs: [],
          outputs: [relockOutput],
          changeAddress: ctx.changeAddress,
          feeNErgs: ctx.feeNErgs
        }

        const minNErgs = ctx.feeNErgs * 2n + MinBoxValue
        if (outputGranted.nErgs < minNErgs)
          return Promise.reject(
            new InsufficientInputs(
              `Minimal amount of nERG required ${minNErgs}, given ${outputGranted.nErgs}`
            )
          )
        else return this.prover.sign(this.txAsm.assemble(txr, ctx.network))
      } else {
        return Promise.reject(new InsufficientInputs(`Output{id='${params.boxId}'} is not a valid lock`))
      }
    } else {
      return Promise.reject(new InsufficientInputs(`Output{id='${params.boxId}'} not found`))
    }
  }
}
