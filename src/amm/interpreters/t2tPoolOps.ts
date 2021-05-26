import { Blake2b256 } from '../../utils/blake2b256';
import { fromHex } from '../../utils/hex';
import { stringToBytea } from '../../utils/utf8';
import {
  BoxSelection,
  ByteaConstant,
  ErgoBoxCandidate,
  ErgoTx,
  Int32Constant,
  Int64Constant,
  Prover,
} from '../../wallet';
import { MinBoxAmountNErgs } from '../../wallet/constants';
import {
  ergoTreeFromAddress,
  ergoTreeToBytea,
} from '../../wallet/entities/ergoTree';
import {
  EmptyRegisters,
  RegisterId,
  registers,
} from '../../wallet/entities/registers';
import { TxRequest } from '../../wallet/entities/txRequest';
import { InsufficientInputs } from '../../wallet/errors/insufficientInputs';
import { TransactionContext } from '../../wallet/models/transactionContext';
import { TxAssembler } from '../../wallet/txAssembler';
import { EmissionLP } from '../constants';
import { T2tPoolContracts as scripts } from '../contracts/t2tPoolContracts';
import { DepositParams } from '../models/depositParams';
import { PoolSetupParams } from '../models/poolSetupParams';
import { RedeemParams } from '../models/redeemParams';
import { SwapParams } from '../models/swapParams';

import { PoolOps } from './poolOps';

export class T2tPoolOps implements PoolOps {
  constructor(
    public readonly prover: Prover,
    public readonly txAssembler: TxAssembler
  ) {}

  async setup(
    params: PoolSetupParams,
    ctx: TransactionContext
  ): Promise<ErgoTx[]> {
    const [x, y] = [params.x.asset, params.y.asset];
    const height = ctx.network.height;
    const inputs = ctx.inputs;
    const outputGranted = inputs.totalOutputWithoutChange;
    const pairIn = [
      outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === x.id),
      outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === y.id),
    ].flat();
    if (pairIn.length == 2) {
      const [tickerX, tickerY] = [
        x.name || x.id.slice(0, 8),
        y.name || y.id.slice(0, 8),
      ];
      const poolBootScript = scripts.poolBoot(EmissionLP);
      const poolSH: Uint8Array = Blake2b256.hash(
        await ergoTreeToBytea(poolBootScript)
      );
      const newTokenLP = { tokenId: inputs.newTokenId, amount: EmissionLP };
      const proxyOut: ErgoBoxCandidate = {
        value: outputGranted.nErgs - ctx.feeNErgs,
        ergoTree: scripts.poolBoot(EmissionLP),
        creationHeight: height,
        assets: [newTokenLP, ...pairIn],
        additionalRegisters: registers([
          [
            RegisterId.R4,
            new ByteaConstant(stringToBytea(`${tickerX}_${tickerY}_LP`)),
          ],
          [RegisterId.R5, new ByteaConstant(poolSH)],
          [RegisterId.R6, new Int64Constant(params.outputShare)],
          [RegisterId.R7, new Int32Constant(params.feeNumerator)],
          [RegisterId.R8, new Int64Constant(ctx.feeNErgs)],
          [RegisterId.R9, new ByteaConstant(fromHex(params.initiatorPk))],
        ]),
      };
      const txr0: TxRequest = {
        inputs: inputs,
        dataInputs: [],
        outputs: [proxyOut],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs,
      };
      const tx0 = await this.prover.sign(this.txAssembler.assemble(txr0));

      const lpP2Pk = await ergoTreeFromAddress(ctx.changeAddress);
      const lpShares = {
        tokenId: newTokenLP.tokenId,
        amount: params.outputShare,
      };
      const lpOut: ErgoBoxCandidate = {
        value: MinBoxAmountNErgs, // todo: calc upon actual feeBerByte.
        ergoTree: lpP2Pk,
        creationHeight: height,
        assets: [lpShares],
        additionalRegisters: EmptyRegisters,
      };

      const poolBootBox = tx0.outputs[0];
      const tx1Inputs = BoxSelection.safe(poolBootBox);

      const newTokenNFT = { tokenId: tx1Inputs.newTokenId, amount: 1n };
      const poolAmountLP = newTokenLP.amount - lpShares.amount;
      const poolLP = { tokenId: newTokenLP.tokenId, amount: poolAmountLP };
      const poolOut: ErgoBoxCandidate = {
        value: poolBootBox.value - lpOut.value - ctx.feeNErgs,
        ergoTree: scripts.pool(EmissionLP),
        creationHeight: height,
        assets: [newTokenNFT, poolLP, ...poolBootBox.assets.slice(1)],
        additionalRegisters: registers([
          [RegisterId.R4, new Int32Constant(params.feeNumerator)],
        ]),
      };
      const txr1: TxRequest = {
        inputs: tx1Inputs,
        dataInputs: [],
        outputs: [poolOut, lpOut],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs,
      };
      const tx1 = await this.prover.sign(this.txAssembler.assemble(txr1));

      return Promise.resolve([tx0, tx1]);
    } else {
      return Promise.reject(
        new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`)
      );
    }
  }

  deposit(params: DepositParams, ctx: TransactionContext): Promise<ErgoTx> {
    const [x, y] = [params.x, params.y];
    const proxyScript = scripts.deposit(
      EmissionLP,
      params.poolId,
      params.pk,
      params.dexFee
    );
    const outputGranted = ctx.inputs.totalOutputWithoutChange;
    const pairIn = [
      outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === x.id),
      outputGranted.tokens.filter((t, _i, _xs) => t.tokenId === y.id),
    ].flat();
    if (pairIn.length == 2) {
      const out: ErgoBoxCandidate = {
        value: outputGranted.nErgs,
        ergoTree: proxyScript,
        creationHeight: ctx.network.height,
        assets: pairIn,
        additionalRegisters: EmptyRegisters,
      };
      const txr = {
        inputs: ctx.inputs,
        dataInputs: [],
        outputs: [out],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs,
      };
      return this.prover.sign(this.txAssembler.assemble(txr));
    } else {
      return Promise.reject(
        new InsufficientInputs(`Token pair {${x.name}|${y.name}} not provided`)
      );
    }
  }

  redeem(params: RedeemParams, ctx: TransactionContext): Promise<ErgoTx> {
    const proxyScript = scripts.redeem(
      EmissionLP,
      params.poolId,
      params.pk,
      params.dexFee
    );
    const outputGranted = ctx.inputs.totalOutputWithoutChange;
    const tokensIn = outputGranted.tokens.filter(
      (t, _i, _xs) => t.tokenId === params.lp.id
    );
    if (tokensIn.length == 1) {
      const out = {
        value: outputGranted.nErgs,
        ergoTree: proxyScript,
        creationHeight: ctx.network.height,
        assets: tokensIn,
        additionalRegisters: EmptyRegisters,
      };
      const txr = {
        inputs: ctx.inputs,
        dataInputs: [],
        outputs: [out],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs,
      };
      return this.prover.sign(this.txAssembler.assemble(txr));
    } else {
      return Promise.reject(new InsufficientInputs(`LP tokens not provided`));
    }
  }

  swap(params: SwapParams, ctx: TransactionContext): Promise<ErgoTx> {
    const proxyScript = scripts.swap(
      params.poolScriptHash,
      params.poolFeeNum,
      params.quoteAsset,
      params.minQuoteOutput,
      params.dexFeePerToken,
      params.pk
    );
    const outputGranted = ctx.inputs.totalOutputWithoutChange;
    const baseAssetId = params.baseInput.asset.id;
    const tokensIn = outputGranted.tokens.filter(
      (t, _i, _xs) => t.tokenId === baseAssetId
    );
    if (tokensIn.length == 1) {
      const out: ErgoBoxCandidate = {
        value: outputGranted.nErgs,
        ergoTree: proxyScript,
        creationHeight: ctx.network.height,
        assets: tokensIn,
        additionalRegisters: EmptyRegisters,
      };
      const txr: TxRequest = {
        inputs: ctx.inputs,
        dataInputs: [],
        outputs: [out],
        changeAddress: ctx.changeAddress,
        feeNErgs: ctx.feeNErgs,
      };
      return this.prover.sign(this.txAssembler.assemble(txr));
    } else {
      return Promise.reject(
        new InsufficientInputs(`Base asset '${baseAssetId}' not provided`)
      );
    }
  }
}
