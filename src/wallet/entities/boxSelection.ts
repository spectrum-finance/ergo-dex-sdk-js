import {
    BoxSelection as LibBoxSelection,
    ErgoBoxes,
    ErgoBoxAssetsData,
    BoxValue, I64, Tokens, Token as LibToken, TokenAmount, ErgoBoxAssetsDataList, TokenId as LibTokenId
} from "ergo-lib-wasm-browser";
import {ChangeBox} from "./changeBox";
import {EmptyInputs} from "../errors/emptyInputs";
import {OverallAmount} from "./overallAmount";
import {notImplemented} from "../../utils/notImplemented";
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
        return { nErgs: nErgs, tokens: tokens }
    }

    toErgoLib(): LibBoxSelection {
        let boxes = new ErgoBoxes(this.boxes[0].toErgoLib())
        let tokens = new Tokens()
        let changeList = new ErgoBoxAssetsDataList()
        if (this.change) {
            this.change.tokens.forEach((v, k, _xs) => {
                tokens.add(new LibToken(k, TokenAmount.from_i64(I64.from_str(v.toString()))))
            })
            let change = new ErgoBoxAssetsData(BoxValue.from_i64(I64.from_str(this.change.value.toString())), tokens)
            for (let box of this.boxes.slice(1)) boxes.add(box.toErgoLib())
            changeList.add(change)
        }
        return new LibBoxSelection(boxes, changeList)
    }
}