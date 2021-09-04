export function evalFirst<T, R>(arr: T[], fn: (t: T) => R | undefined): R | undefined {
  let maybeR: R | undefined = undefined
  for (const e of arr) {
    const res = fn(e)
    if (res) {
      maybeR = res
      break
    }
  }
  return maybeR
}
