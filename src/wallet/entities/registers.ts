import {RegisterId} from "./registerId";
import {Constant} from "./constant";

export type Registers = Map<RegisterId, Constant>

type Register = { id: RegisterId, value: Constant }

export const EmptyRegisters: Registers = new Map<RegisterId, Constant>()

export function registers(regs: Register[]): Registers {
    let acc = EmptyRegisters
    for (let r of regs) acc.set(r.id, r.value)
    return acc
}