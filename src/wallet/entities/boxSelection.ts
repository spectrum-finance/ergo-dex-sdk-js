import {ChangeBox} from "./changeBox";
import {EmptyInputs} from "../errors/emptyInputs";
import {OverallAmount} from "./overallAmount";
import {ErgoBox} from "./ergoBox";
import {Token} from "./token";
import {TokenId} from "../types";

export class BoxSelection {
    readonly boxes: ErgoBox[]
    readonly change?: ChangeBox

    private constructor(boxes: ErgoBox[], change?: ChangeBox) {
        this.boxes = boxes
        this.change = change
    }

    static make(inputs: ErgoBox[], change?: ChangeBox): BoxSelection | EmptyInputs {
        return inputs.length > 0 ? new BoxSelection(inputs, change) : new EmptyInputs()
    }

    static safe(head: ErgoBox, others?: ErgoBox[], change?: ChangeBox): BoxSelection {
        return new BoxSelection([head].concat(others || []), change)
    }

    /** Amounts of all kinds of tokens with change excluded.
     */
    totalOutputWithoutChange(): OverallAmount {
        let nErgsIn = this.boxes.map((bx, _i, _xs) => bx.value).reduce((x, y, _i, _xs) => x + y)
        let nErgsChange = this.change?.value || 0n
        let nErgs = nErgsIn - nErgsChange
        let tokensAgg = new Map<TokenId, bigint>()
        for (let t of this.boxes.flatMap((bx, _i, _xs) => bx.tokens)) {
            let acc = tokensAgg.get(t.id) || 0n
            tokensAgg.set(t.id, t.amount + acc)
        }
        let tokens: Token[] = []
        tokensAgg.forEach((amount, id, _xs) => tokens.push(new Token(id, amount)))
        return {nErgs: nErgs, tokens: tokens}
    }
}