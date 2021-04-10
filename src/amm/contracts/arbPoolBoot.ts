export const ArbPoolBootScriptTemplate = `{
    val InitiallyLockedLP = $emissionLPL

    val poolScriptHash  = SELF.R4[Coll[Byte]].get
    val desiredSharesLP = SELF.R5[Long].get
    val poolFeeConfig   = SELF.R6[Long].get

    val selfLP = SELF.tokens(0)
    val selfX  = SELF.tokens(1)
    val selfY  = SELF.tokens(2)

    val tokenIdLP = selfLP._1

    val validSelfLP            = selfLP._2 == InitiallyLockedLP
    val validSelfPoolFeeConfig = poolFeeConfig <= 1000L && poolFeeConfig > 750L

    val pool           = OUTPUTS(0)
    val sharesRewardLP = OUTPUTS(1)

    val maybePoolLP  = pool.tokens(1)
    val poolAmountLP =
        if (maybePoolLP._1 == tokenIdLP) maybePoolLP._2
        else 0L

    val validPoolContract  = blake2b256(pool.propositionBytes) == poolScriptHash
    val validPoolErgAmount = pool.value == SELF.value - sharesRewardLP.value
    val validPoolNFT       = pool.tokens(0) == (SELF.id, 1L)
    val validPoolConfig    = pool.R4[Long].get == poolFeeConfig 

    val validInitialDepositing = {
        val tokenX     = pool.tokens(2)
        val tokenY     = pool.tokens(3)
        val depositedX = tokenX._2
        val depositedY = tokenY._2

        val validTokens  = tokenX == selfX && tokenY == selfY
        val validDeposit = depositedX.toBigInt * depositedY == desiredSharesLP.toBigInt * desiredSharesLP
        val validShares  = poolAmountLP >= (InitiallyLockedLP - desiredSharesLP)
        
        validTokens && validDeposit && validShares
    }

    val validPool = validPoolContract && validPoolErgAmount && validPoolNFT && validInitialDepositing

    val initialDepositorProp = INPUTS(0).propositionBytes

    val validSharesRewardLP =
        sharesRewardLP.propositionBytes == initialDepositorProp &&
        sharesRewardLP.tokens(0) == (tokenIdLP, desiredSharesLP)
    
    sigmaProp(validSelfLP && validSelfPoolFeeConfig && validPool && validSharesRewardLP)
}`
