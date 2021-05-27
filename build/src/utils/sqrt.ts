export function sqrt(x: bigint): bigint {
    function go(n: bigint, x0: bigint): bigint {
        const x1 = ((n / x0) + x0) >> 1n
        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0
        }
        return go(n, x1)
    }

    if (x < 0n) throw "Square root of negative number is not supported"
    else if (x < 2n) return x
    else return go(x, 1n)
}