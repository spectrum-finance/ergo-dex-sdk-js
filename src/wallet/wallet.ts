import { Address } from './entities/address';
import { Balance } from './models/balance';
import { Prover } from './prover';

export interface Wallet extends Prover {
  /** Get total wallet balance.
   */
  getBalance(): Promise<Balance>;

  /** Get change address.
   */
  getChangeAddress(): Promise<Address>;

  /** Get wallet addresses.
   * @param unused - show only unused addresses
   */
  getAddresses(unused: boolean): Promise<Address[]>;
}
