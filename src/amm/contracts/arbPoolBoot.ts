export const ArbPoolBootTemplate = `{
    val PoolScriptHash = $poolScriptHash

    val selfLP       = SELF.tokens(0)
    val selfAmountLP = selfLP._2

    val pool = OUTPUTS(0)

    val maybePoolLP  = pool.tokens(1)
    val poolAmountLP =
        if (maybePoolLP._1 == selfLP._1) maybePoolLP._2
        else 0L

    val validContract  = blake2b256(pool.propositionBytes) == PoolScriptHash
    val validErgAmount = pool.value >= SELF.value
    val validPoolNFT   = pool.tokens(0) == (SELF.id, 1L)

    val validInitialDepositing = {
        val depositedX   = pool.tokens(2)._2
        val depositedY   = pool.tokens(3)._2
        val desiredShare = pool.R4[Long].get
        val validDeposit = depositedX.toBigInt * depositedY == desiredShare.toBigInt * desiredShare
        val validShares  = poolAmountLP >= (selfAmountLP - desiredShare)
        validDeposit && validShares
    }
    
    sigmaProp(validContract && validErgAmount && validPoolNFT && validInitialDepositing)
}`