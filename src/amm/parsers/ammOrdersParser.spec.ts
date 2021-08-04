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
    "id": "2f4423746815762bcdf3260d492646f973caa4310dcbb7485e0befdde9fe4545",
    "blockId": "288db0817cf7b49da9c91323f5384cd2f670712451ebd3ff120c6fddd6451dd9",
    "inclusionHeight": 546841,
    "timestamp": 1628066832799,
    "index": 5,
    "globalIndex": 1581999,
    "numConfirmations": 3,
    "inputs": [
        {
            "boxId": "a166f1ee13a58150c2dfe3fee6a614647a3cb476a4d26386b9fa4d5fde5cc572",
            "value": 1732749950,
            "index": 0,
            "spendingProof": "2f4b70c7a865b5d8c997fe14f575b1271ec7208c6274183f9cee65025f77f8ed2cc64167168d788c0e98a4343199ac4763b56dbc68530bf0",
            "outputBlockId": "6d69ef34f4383db2754567bfcb9ed7066363f0c46694008c52183940c95cd69f",
            "outputTransactionId": "417bbe68556a9dfa48c6ab4a286d78cfa06a7e2585be17eb8cd3cf8401cc7cd5",
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
                    "amount": 44979489328480431,
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
            "boxId": "4648a43d26a7cbc08875161694ca524e75e0a2aca1701fbbe0b0a61542f14f52",
            "transactionId": "2f4423746815762bcdf3260d492646f973caa4310dcbb7485e0befdde9fe4545",
            "blockId": "288db0817cf7b49da9c91323f5384cd2f670712451ebd3ff120c6fddd6451dd9",
            "value": 6650000,
            "index": 0,
            "globalIndex": 5958629,
            "creationHeight": 508928,
            "settlementHeight": 546841,
            "ergoTree": "101308cd03e5c2313e2986dfd05984d1237cf815979cac01c61f29762d5b8d316a0ae1b95404000e20ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b04c80f04d00f040404080404040004040400040606010104000e20f1fb942ebd039dc782fd9109acdb60aabea4dc7e75e9c813b6528c62692fc7810580c2d72f050205140100d805d6017300d602b2a4730100d6037302d6047303d6057304eb027201d195ed93b1a4730593b1db630872027306d80ad606db63087202d607b2a5730700d608b2db63087207730800d6098c720802d60a7e720906d60bb27206730900d60c7e8c720b0206d60d7e8cb2db6308a7730a000206d60e7e8cb27206730b000206d60f9a720a730cededededed938cb27206730d0001730e93c27207d07201938c7208017203927209730f927ec1720706997ec1a7069d9c720a7e7310067e73110695938c720b017203909c9c720c720d7e7204069c720f9a9c720e7e7205069c720d7e720406909c9c720e720d7e7204069c720f9a9c720c7e7205069c720d7e7204067312",
            "address": "2VYfZw9Mi14WYDADMopD9qvTfWa7Vuh243gHHEmmRCszKP3xMRnAubpwKef7pSVren97mNNeWj9VbMxRGyaDGAmz6RhEQai4S48FGwM6AstHCQkPEJr8t5b2t3gyUiuUyFJXJkxcDChYhjBjrEJJ7HuWEb23aepugzyEuispeMC6nYe5TgviSEYgPYAxbZdHmbqSjjncHLAHrQaSkiK6W3DENftiHqFWT98jL2MM2p71u4rEfJcGd9anE77VKjcquibuaP4uCJZmGnofariMXepopNCMLJhj4Cyra9v8D2hyftz4dBKmHvMWdmARBo1B5bM2uqmasBFdq651XuQaCGzQHVFLNUibeAnP39aLUZALDwMGc75Z15rNnRaptCrgUbc3nFekGx7S78mm9AzxFa88KPQsMWt6WoLBy56hduwa8BYW2taMcPVr9bBhJPDyMAaa5h86AG7gPsLTeJGP51Ybgskuw2cPZex5eMVMw8f972xiHZk9pi7hLBkcgsH1yJKcYUsdadAs69byEm4XfbgZzWnDJsFfZGDqtY1mxpreV",
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
            "spentTransactionId": null,
            "mainChain": true
        },
        {
            "boxId": "6ff3c5226abb8a6330fca4c85d761e26797a3333bbbcda013ccbf01ee8f3b924",
            "transactionId": "2f4423746815762bcdf3260d492646f973caa4310dcbb7485e0befdde9fe4545",
            "blockId": "288db0817cf7b49da9c91323f5384cd2f670712451ebd3ff120c6fddd6451dd9",
            "value": 1724849950,
            "index": 1,
            "globalIndex": 5958630,
            "creationHeight": 508928,
            "settlementHeight": 546841,
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
                    "amount": 44979489232549064,
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
            "boxId": "fdbfeea5a6022660350f942927aa7dc050d6b3918e0b3701392f7daf2c6097f3",
            "transactionId": "2f4423746815762bcdf3260d492646f973caa4310dcbb7485e0befdde9fe4545",
            "blockId": "288db0817cf7b49da9c91323f5384cd2f670712451ebd3ff120c6fddd6451dd9",
            "value": 1250000,
            "index": 2,
            "globalIndex": 5958631,
            "creationHeight": 508928,
            "settlementHeight": 546841,
            "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
            "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
            "assets": [],
            "additionalRegisters": {},
            "spentTransactionId": "dba4980887485c52977836cf5f64f397eee9a37cc46199afefef2c21ea1743c7",
            "mainChain": true
        }
    ],
    "size": 834
}`
