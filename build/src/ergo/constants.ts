import {MinerAddress} from "ergo-lib-wasm-browser";
import {Address} from "./entities/address";

export const MinBoxAmountNErgs = 10000n

export const MinerAddressMainnet: Address = MinerAddress.mainnet_fee_address()
export const MinerAddressTestnet: Address = MinerAddress.testnet_fee_address()
