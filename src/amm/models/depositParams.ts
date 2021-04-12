import {AssetAmount} from "../../entities/assetAmount";

export class DepositParams {
    readonly x: AssetAmount
    readonly y: AssetAmount

    constructor(x: AssetAmount, y: AssetAmount) {
        this.x = x
        this.y = y
    }
}