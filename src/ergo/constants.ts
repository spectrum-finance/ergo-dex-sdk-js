import { RustModule } from '../utils/rustLoader';

import {Address} from "./entities/address";

export const MinBoxAmountNErgs = 10000n

// TODO: We should use functions to get values, because constants initialise
//  at the module start.
//  need to RustModule.load() first
export const MinerAddressMainnet: Address = RustModule.SigmaRust.MinerAddress.mainnet_fee_address()
export const MinerAddressTestnet: Address = RustModule.SigmaRust.MinerAddress.testnet_fee_address()
