import {TokenAmount} from "../../entities/tokenAmount";

export class DepositParams {
    readonly x: TokenAmount
    readonly y: TokenAmount

    constructor(x: TokenAmount, y: TokenAmount) {
        this.x = x
        this.y = y
    }
}