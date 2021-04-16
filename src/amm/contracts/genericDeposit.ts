export const GenericDepositTemplate = `{
    val InitiallyLockedLP = $emissionLPL
    
    val PoolNFT = $poolNFT
    val Pk      = $pk

    val selfX = SELF.tokens(0)
    val selfY = SELF.tokens(1)

    val poolIn = INPUTS(0)

    val validPoolIn = poolIn.tokens(0) == (PoolNFT, 1L)

    val poolLP    = poolIn.tokens(1)
    val reservesX = poolIn.tokens(2)
    val reservesY = poolIn.tokens(2)

    val supplyLP = InitiallyLockedLP - poolLP._2

    val minimalReward = min(
        selfX.toBigInt * supplyLP / reservesX,
        selfY.toBigInt * supplyLP / reservesY
    )

    val rewardOut = OUTPUTS(1)
    val rewardLP  = rewardOut.tokens(0)

    val validRewardOut =
        rewardOut.propositionBytes == Pk.propBytes &&
        rewardLP._1 == poolLP._1 &&
        rewardLP._2 >= minimalReward

    sigmaProp(Pk || (validPoolIn && validRewardOut))
}`