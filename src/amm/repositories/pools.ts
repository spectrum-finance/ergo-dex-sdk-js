import { Paging } from '../../network/paging';
import { ErgoNetwork } from '../../services/ergoNetwork';
import { Blake2b256 } from '../../utils/blake2b256';
import { toHex } from '../../utils/hex';
import { AssetAmount, Int32Constant } from '../../wallet';
import { RegisterId } from '../../wallet/entities/registers';
import { EmissionLP } from '../constants';
import { T2tPoolContracts } from '../contracts/t2tPoolContracts';
import { AmmPool } from '../entities/ammPool';
import { PoolId } from '../types';

export interface Pools {
  get(id: PoolId): Promise<AmmPool | undefined>;

  getAll(paging: Paging): Promise<AmmPool[]>;
}

export class NetworkPools implements Pools {
  constructor(readonly network: ErgoNetwork) {}

  // @ts-ignore
  async get(id: PoolId): Promise<AmmPool | undefined> {
    const boxes = await this.network.getUnspentByTokenId(id, {
      offset: 0,
      limit: 1,
    });
    if (boxes.length > 0) {
      const poolBox = boxes[0];
      const assetX = AssetAmount.fromToken(poolBox.assets[2]);
      const assetY = AssetAmount.fromToken(poolBox.assets[3]);
      const r4 = poolBox.additionalRegisters.get(RegisterId.R4);
      if (
        r4 instanceof Int32Constant &&
        poolBox.ergoTree === T2tPoolContracts.pool(EmissionLP)
      ) {
        const scriptHash = toHex(Blake2b256.hash(poolBox.ergoTree));
        return new AmmPool(id, assetX, assetY, scriptHash, r4.value);
      }
    }
  }

  async getAll(paging: Paging): Promise<AmmPool[]> {
    const boxes = await this.network.getUnspentByErgoTreeTemplateHash(
      T2tPoolContracts.poolTemplateHash(EmissionLP),
      paging
    );
    const pools = [];
    for (const box of boxes) {
      const nft = box.assets[0].tokenId;
      const assetX = AssetAmount.fromToken(box.assets[2]);
      const assetY = AssetAmount.fromToken(box.assets[3]);
      const r4 = box.additionalRegisters.get(RegisterId.R4);
      if (r4 instanceof Int32Constant) {
        const scriptHash = toHex(Blake2b256.hash(box.ergoTree));
        pools.push(new AmmPool(nft, assetX, assetY, scriptHash, r4.value));
      }
    }
    return pools;
  }
}
