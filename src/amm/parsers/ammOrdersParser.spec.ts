import test from "ava"
import {RustModule} from "../../utils/rustLoader"
import {DefaultAmmOrdersParser} from "./ammOrdersParser"
import {AssetAmount, ErgoTx} from "../../ergo"
import {explorerToErgoTx} from "../../network/models"
import {JSONBI} from "../../utils/json"
import {AmmOrderInfo} from "../models/ammOrderInfo"

test.before(async () => {
  await RustModule.load(true)
})

const parser = new DefaultAmmOrdersParser()

test("parse swap", t => {
  const tx: ErgoTx = explorerToErgoTx(JSONBI.parse(txJson))
  const parsed = tx.outputs.map(o => parser.parse(o)).filter(x => x)
  const expected: AmmOrderInfo[] = [
    {
      from: new AssetAmount(
        {
          id: "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
          name: "WT_ADA",
          decimals: 8
        },
        95931367n
      ),
      poolId: "f1fb942ebd039dc782fd9109acdb60aabea4dc7e75e9c813b6528c62692fc781",
      to: {
        id: "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b"
      },
      type: "swap"
    }
  ]
  t.deepEqual(parsed, expected)
})

const txJson = `{
    "id": "417bbe68556a9dfa48c6ab4a286d78cfa06a7e2585be17eb8cd3cf8401cc7cd5",
    "blockId": "6d69ef34f4383db2754567bfcb9ed7066363f0c46694008c52183940c95cd69f",
    "inclusionHeight": 546156,
    "timestamp": 1627989063748,
    "index": 4,
    "globalIndex": 1578823,
    "numConfirmations": 87,
    "inputs": [
        {
            "boxId": "00e65ba23378a6ea07558aabf6a74355388cff52bd5c7bdfd4701267a4a36f95",
            "value": 1740649950,
            "index": 0,
            "spendingProof": "36a076302108bbcc388d43fc0bf55cf6c73686d15dd58965a4190b7b273b12deffa57fd760dca1a81fb505b338dae1489a3818a1ea296ead",
            "outputBlockId": "c58b806bddbf69d19eff2c5385447ff624121ecf745196e1f26231688ce0d9c9",
            "outputTransactionId": "3609fffee79370729cb7bc9677480b90deac05e57afca5ad8027771653a9c49a",
            "outputIndex": 1,
            "ergoTree": "0008cd03e5c2313e2986dfd05984d1237cf815979cac01c61f29762d5b8d316a0ae1b954",
            "address": "9iCzZksco8R2P8HXTsZiFAq2km59PDznuTykBRjHd74BfBG3kk8",
            "assets": [
                {
                    "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                    "index": 0,
                    "amount": 889000000000,
                    "name": "TERG",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 1,
                    "amount": 89998998999999998,
                    "name": "TUSD",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                    "index": 2,
                    "amount": 99984950000000000,
                    "name": "WT_ERG",
                    "decimals": 9,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                    "index": 3,
                    "amount": 44979489424411798,
                    "name": "WT_ADA",
                    "decimals": 8,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {}
        }
    ],
    "dataInputs": [],
    "outputs": [
        {
            "boxId": "c6af95dfa40a8093b3fe70f5155d42a13391f1f29a24adcf227d856bc2b11522",
            "transactionId": "417bbe68556a9dfa48c6ab4a286d78cfa06a7e2585be17eb8cd3cf8401cc7cd5",
            "blockId": "6d69ef34f4383db2754567bfcb9ed7066363f0c46694008c52183940c95cd69f",
            "value": 6650000,
            "index": 0,
            "globalIndex": 5935459,
            "creationHeight": 506880,
            "settlementHeight": 546156,
            "ergoTree": "101408cd03e5c2313e2986dfd05984d1237cf815979cac01c61f29762d5b8d316a0ae1b95404000e20ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b04c80f04d00f040204080404040004040400040606010104000e20f1fb942ebd039dc782fd9109acdb60aabea4dc7e75e9c813b6528c62692fc78104040580c2d72f050205140100d806d6017300d602b1a4d603b2a4730100d6047302d6057303d6067304eb027201d195ed947202730593b1db630872037306d80ad607db63087203d608b2a5730700d609b2db63087208730800d60a8c720902d60b7e720a06d60cb27207730900d60d7e8c720c0206d60e7e8cb2db6308a7730a000206d60f7e8cb27207730b000206d6109a720b730cedededededed938cb27207730d0001730e937202730f93c27208d07201938c720901720492720a7310927ec1720806997ec1a7069d9c720b7e7311067e73120695938c720c017204909c9c720d720e7e7205069c72109a9c720f7e7206069c720e7e720506909c9c720f720e7e7205069c72109a9c720d7e7206069c720e7e7205067313",
            "address": "8D6pmAXxCvMLx3CPszrhtxc7zPcAnDQcDzN6BXYEA4tCk9vSLPNqPs53zwVF5mgdVZFYLMkeRrZdizpF16Vgmw9bNDnR8weApPkbN4J6Rq1FBhoFBF8ztLb5cgCzsk2UPFuDCJf4ww5hRYeAwJrZQBNXjXi7H7z4Cy3o1FevSArdNoXWpxVRvZk4vYqNxFMwcHn429PxZNFxgEbJrw5BjHMt6j1zaB8gm9H4Aeugoevok88peTNF7i3iGukCAPgUEq21PP2FK8fAVwALtEqTU4ZpjWuN5eoc7Q7h6i5RJhsE5iFfXLX1oFpY1gKYqWS5BNJKR2LLPR9xxB8qTEWGdTnZQxQF3HAyhWW9xLmbywtvWJM6HzvhZ2LpG1PAotnhifaCKhHtCRR8JYbytyXupobXydRezzRZDPC1GX8D9YDgx9raFW1jyvWm9BMWD91WbdihxPBjRxGC9ZMpXMmR2o7SGCmHDTCEVVwhF9SFoaSPcrtaqrARg5BXyxGzaCKYUGopsvErgCjez4wFSaUA4cQT12jfMeEXerUc7cgSd1LEP6cFzLz2ckyMMEtXx",
            "assets": [
                {
                    "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                    "index": 0,
                    "amount": 95931367,
                    "name": "WT_ADA",
                    "decimals": 8,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {},
            "spentTransactionId": "4ce8f53828fcbfb1168424cd711730291a6856156cef378c86e3f96d5a4a00e8",
            "mainChain": true
        },
        {
            "boxId": "a166f1ee13a58150c2dfe3fee6a614647a3cb476a4d26386b9fa4d5fde5cc572",
            "transactionId": "417bbe68556a9dfa48c6ab4a286d78cfa06a7e2585be17eb8cd3cf8401cc7cd5",
            "blockId": "6d69ef34f4383db2754567bfcb9ed7066363f0c46694008c52183940c95cd69f",
            "value": 1732749950,
            "index": 1,
            "globalIndex": 5935460,
            "creationHeight": 506880,
            "settlementHeight": 546156,
            "ergoTree": "0008cd03e5c2313e2986dfd05984d1237cf815979cac01c61f29762d5b8d316a0ae1b954",
            "address": "9iCzZksco8R2P8HXTsZiFAq2km59PDznuTykBRjHd74BfBG3kk8",
            "assets": [
                {
                    "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                    "index": 0,
                    "amount": 889000000000,
                    "name": "TERG",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 1,
                    "amount": 89998998999999998,
                    "name": "TUSD",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                    "index": 2,
                    "amount": 99984950000000000,
                    "name": "WT_ERG",
                    "decimals": 9,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                    "index": 3,
                    "amount": 44979489328480431,
                    "name": "WT_ADA",
                    "decimals": 8,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {},
            "spentTransactionId": null,
            "mainChain": true
        },
        {
            "boxId": "25c2935068e30f28a3bb7820ecdd5cde43cb3d2e044ddba06f1bb2854c050bc9",
            "transactionId": "417bbe68556a9dfa48c6ab4a286d78cfa06a7e2585be17eb8cd3cf8401cc7cd5",
            "blockId": "6d69ef34f4383db2754567bfcb9ed7066363f0c46694008c52183940c95cd69f",
            "value": 1250000,
            "index": 2,
            "globalIndex": 5935461,
            "creationHeight": 506880,
            "settlementHeight": 546156,
            "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
            "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
            "assets": [],
            "additionalRegisters": {},
            "spentTransactionId": "1924379c82d705c0ddc94e92243d6205949d5fc3fa939462ea64dc585558fcd6",
            "mainChain": true
        }
    ],
    "size": 846
}`
