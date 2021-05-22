import {RegisterId} from "./registerId";
import {Constant} from "./constant";

export type Registers = Map<RegisterId, Constant>

export const EmptyRegisters: Registers = new Map<RegisterId, Constant>()

export function makeRegisters(regs: { id: RegisterId, value: Constant }[]): Registers {
    let acc = EmptyRegisters
    for (let r of regs) acc.set(r.id, r.value)
    return acc
}