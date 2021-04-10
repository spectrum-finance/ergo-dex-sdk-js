import {
    ErgoBox,
    BoxSelection as ErgoLibBoxSelection,
    ErgoBoxes,
    ErgoBoxAssetsData,
    BoxValue, I64, Tokens, Token, TokenAmount, ErgoBoxAssetsDataList
} from "ergo-lib-wasm-browser";
import {ChangeBox} from "./changeBox";
import {EmptyInputs} from "../errors/emptyInputs";
import {OverallAmount} from "./overallAmount";
import {notImplemented} from "../../utils/notImplemented";

export class BoxSelection {
    readonly head: ErgoBox
    readonly tail: ErgoBox[]
    readonly change?: ChangeBox

    private constructor(head: ErgoBox, tail?: ErgoBox[], change?: ChangeBox) {
        this.head = head
        this.tail = tail ? tail : []
        this.change = change
    }

    static make(inputs: ErgoBox[], change?: ChangeBox): BoxSelection | EmptyInputs {
        return inputs.length > 0 ? new BoxSelection(inputs[0], inputs.slice(1), change) : new EmptyInputs()
    }

    get nonEmptyInputsArray(): ErgoBox[] {
        return [this.head].concat(this.tail)
    }

    /** Amounts of all kinds of tokens with change excluded.
     */
    totalOutputWithoutChange(): OverallAmount {
        return notImplemented()
    }

    toErgoLib(): ErgoLibBoxSelection {
        let boxes = new ErgoBoxes(this.head)
        let tokens = new Tokens()
        let changeList = new ErgoBoxAssetsDataList()
        if (this.change) {
            this.change.tokens.forEach((v, k, _xs) => {
                tokens.add(new Token(k, TokenAmount.from_i64(I64.from_str(v.toString()))))
            })
            let change = new ErgoBoxAssetsData(BoxValue.from_i64(I64.from_str(this.change.value.toString())), tokens)
            for (let box of this.tail) boxes.add(box)
            changeList.add(change)
        }
        return new ErgoLibBoxSelection(boxes, changeList)
    }
}