import {Constant} from "./constant";

export enum RegisterId {
    R4 = "R4",
    R5 = "R5",
    R6 = "R6",
    R7 = "R7",
    R8 = "R8",
    R9 = "R9"
}

export function parseRegisterId(s: string): RegisterId | undefined {
    switch (s) {
        case "R4":
            return RegisterId.R4
        case "R5":
            return RegisterId.R5
        case "R6":
            return RegisterId.R6
        case "R7":
            return RegisterId.R7
        case "R8":
            return RegisterId.R8
        case "R9":
        default:
            return RegisterId.R9
    }
}

export type Registers = Map<RegisterId, Constant>

export const EmptyRegisters: Registers = new Map<RegisterId, Constant>()

export function registers(regs: [RegisterId, Constant][]): Registers {
    let acc = EmptyRegisters
    for (let [id, value] of regs) acc.set(id, value)
    return acc
}
