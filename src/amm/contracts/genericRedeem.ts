export const GenericRedeemTemplate = `{
    val InitiallyLockedLP = $emissionLPL
    
    val PoolNFT = $poolNFT
    val Pk      = $pk

    val selfLP = SELF.tokens(0)

    val poolIn = INPUTS(0)

    val validPoolIn = poolIn.tokens(0) == (PoolNFT, 1L)

    val poolLP    = poolIn.tokens(1)
    val reservesX = poolIn.tokens(2)
    val reservesY = poolIn.tokens(2)

    val supplyLP = InitiallyLockedLP - poolLP._2

    val shareLP = selfLP._1.toBigInt / supplyLP

    val minReturnX = shareLP * reservesX
    val minReturnY = shareLP * reservesY

    val returnOut = OUTPUTS(1)

    val returnX = returnOut.tokens(0)
    val returnY = returnOut.tokens(1)

    val validReturnOut =
        returnOut.propositionBytes == Pk.propBytes &&
        returnOut.value >= SELF.value &&
        returnX._1 == reservesX._1 &&
        returnY._1 == reservesY._1 &&
        returnX._2 >= minReturnX &&
        returnY._2 >= minReturnY

    sigmaProp(Pk || (validPoolIn && validReturnOut))
}`