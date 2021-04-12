import {
    BoxSelection as LibBoxSelection,
    ErgoBoxes,
    ErgoBoxAssetsData,
    BoxValue, I64, Tokens, Token, TokenAmount, ErgoBoxAssetsDataList
} from "ergo-lib-wasm-browser";
import {ChangeBox} from "./changeBox";
import {EmptyInputs} from "../errors/emptyInputs";
import {OverallAmount} from "./overallAmount";
import {notImplemented} from "../../utils/notImplemented";
import {ErgoBox} from "./ergoBox";

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
        return notImplemented()
    }

    toErgoLib(): LibBoxSelection {
        let boxes = new ErgoBoxes(this.boxes[0].toErgoLib())
        let tokens = new Tokens()
        let changeList = new ErgoBoxAssetsDataList()
        if (this.change) {
            this.change.tokens.forEach((v, k, _xs) => {
                tokens.add(new Token(k, TokenAmount.from_i64(I64.from_str(v.toString()))))
            })
            let change = new ErgoBoxAssetsData(BoxValue.from_i64(I64.from_str(this.change.value.toString())), tokens)
            for (let box of this.boxes.slice(1)) boxes.add(box.toErgoLib())
            changeList.add(change)
        }
        return new LibBoxSelection(boxes, changeList)
    }
}