import { Constant } from './constant';

export enum RegisterId {
  R4 = 'R4',
  R5 = 'R5',
  R6 = 'R6',
  R7 = 'R7',
  R8 = 'R8',
  R9 = 'R9',
}

export type Registers = Map<RegisterId, Constant>;

export const EmptyRegisters: Registers = new Map<RegisterId, Constant>();

export function registers(regs: [RegisterId, Constant][]): Registers {
  const acc = EmptyRegisters;
  for (const [id, value] of regs) acc.set(id, value);
  return acc;
}
