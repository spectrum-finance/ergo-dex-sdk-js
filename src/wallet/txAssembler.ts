import { TxRequest } from './entities/txRequest';
import { UnsignedErgoTx } from './entities/unsignedErgoTx';

export interface TxAssembler {
  assemble(req: TxRequest): UnsignedErgoTx;
}
