import {all, BigNumber, ConfigOptions, create, FormatOptions, MathJsStatic} from "mathjs"

const mathConf: ConfigOptions = {
  epsilon: 1e-24,
  matrix: "Matrix",
  number: "BigNumber",
  precision: 64
}

const formatOptions: FormatOptions = {
  notation: "fixed"
}

const math = create(all, mathConf) as Partial<MathJsStatic>

export function evaluate(expr: string): string {
  return math.format!(math.evaluate!(expr), formatOptions)
}

export function decimalToFractional(n: BigNumber | number): [bigint, bigint] {
  const fmtN = math.format!(n, formatOptions)
  const [whole, decimals = ""] = String(fmtN).split(".")
  const numDecimals = decimals.length
  const denominator = BigInt(evaluate(`10^${numDecimals}`))
  const numerator = BigInt(whole) * denominator + BigInt(decimals)
  return [numerator, denominator]
}
