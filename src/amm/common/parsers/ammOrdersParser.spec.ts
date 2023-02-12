import test from "ava"
import {AssetAmount, ErgoTx, RustModule} from "@ergolabs/ergo-sdk"
import {explorerToErgoTx} from "@ergolabs/ergo-sdk/build/main/network/models"
import {DefaultAmmOrdersParser} from "./ammOrdersParser"
import {JSONBI} from "../../../utils/json"
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

test("parse unconfirmed redeem", t => {
  const tx: ErgoTx = explorerToErgoTx(JSONBI.parse(utxJson))
  const parsed = tx.outputs.map(o => parser.parse(o)).filter(x => x)
  const expected: AmmOrderInfo[] = [
    {
      inLP: new AssetAmount(
        {
          id: "e0588d273c8183865cff31b3bfa766bc7b178e2362b45497b67e79662e3615b7",
          name: undefined,
          decimals: undefined
        },
        7071n
      ),
      poolId: "65fa572bc4a7007e5a6450c9af2bfa1594e6dfb43b667027f1930eefddeac7bf",
      type: "redeem"
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

const utxJson = `{
  "id": "a9851a458000d3599449a669f4b9c0bac408f450dfeff89fed7dad2e6780241c",
  "creationTimestamp": 1628626811216,
  "inputs": [
      {
          "boxId": "02a9a2872addc117a08b514e516d0d7265b837037902a8a25073bc7d6c98c74e",
          "value": 10000000,
          "index": 0,
          "spendingProof": "be6c1b453771ceb924cc0359dc5664541ecd51fd33f41362d4a59478500f9991d54495b2bb94be7c20f7e3078909af999ced798aa52ae11f",
          "outputBlockId": "1b3832dafc313efaaa3dc12b6f2ee97ab8ad8a0fa8056516ed067c5e17bbc375",
          "outputTransactionId": "883d7a8e5abd00779a098d3e191306e486f854c7de6b6a3bdbb071efb2bddbeb",
          "outputIndex": 1,
          "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
          "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
          "assets": [
              {
                  "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                  "index": 0,
                  "amount": 33796097282,
                  "name": "WT_ERG",
                  "decimals": 9,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                  "index": 1,
                  "amount": 64049721480,
                  "name": "WT_ADA",
                  "decimals": 8,
                  "type": "EIP-004"
              }
          ],
          "additionalRegisters": {}
      },
      {
          "boxId": "f530d7d5807fab65acc2c163fd01ba8df8889fa46d67fe90029ad0d87d33145d",
          "value": 100000,
          "index": 1,
          "spendingProof": "f63cb42d48e1d9b8b42e9697f46fe53d769e53adc30f314bc5342d1172044648186b48f86136fb307aee88168ae1e8f7f627fe56c85c2f03",
          "outputBlockId": "dedc4f1703f2ee5fc17667ec1e7c36dabf73b6e1b03c0e577a4a5e5af4b12f56",
          "outputTransactionId": "e931a5927fe37d6d8b142acde76473b5637e795697c9148d45e9243d7593355e",
          "outputIndex": 2,
          "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
          "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
          "assets": [
              {
                  "tokenId": "e0588d273c8183865cff31b3bfa766bc7b178e2362b45497b67e79662e3615b7",
                  "index": 0,
                  "amount": 7071,
                  "name": null,
                  "decimals": null,
                  "type": null
              }
          ],
          "additionalRegisters": {}
      },
      {
          "boxId": "f756e988c9e44ebb005cde1dfb8ce722b13441742571ed4786c7a8d7c8bd983d",
          "value": 722006098,
          "index": 2,
          "spendingProof": "1f8f16b3546c272e836cb4f11b9658cfa28516d83644b767d08c7bd190361b5dc29f1cda800b5168ace3c066e380f0aaab5ad0c7a7bee66d",
          "outputBlockId": "cfadf7f683be7c782c87554e850982e8a6e3ff26ebe85355bf6665cfd16402e1",
          "outputTransactionId": "ec4486d64c38e754e71c4999d5ef90a88804484432063c19e393a43ad5bc4a41",
          "outputIndex": 1,
          "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
          "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
          "assets": [
              {
                  "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                  "index": 0,
                  "amount": 153906143482,
                  "name": "WT_ADA",
                  "decimals": 8,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                  "index": 1,
                  "amount": 1958372732970,
                  "name": "WT_ERG",
                  "decimals": 9,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                  "index": 2,
                  "amount": 1000000000,
                  "name": "TUSD",
                  "decimals": 0,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                  "index": 3,
                  "amount": 999999900,
                  "name": "TERG",
                  "decimals": 0,
                  "type": "EIP-004"
              }
          ],
          "additionalRegisters": {}
      }
  ],
  "dataInputs": [],
  "outputs": [
      {
          "boxId": "048a1f69a0ded21be0550c44e48c5f8291831c346a11a8ddd66b09c925aa1003",
          "transactionId": "a9851a458000d3599449a669f4b9c0bac408f450dfeff89fed7dad2e6780241c",
          "value": 20000000,
          "index": 0,
          "creationHeight": 506880,
          "ergoTree": "19c3021108cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a04000404040804020400040404020406040005feffffffffffffffff01040204000e2065fa572bc4a7007e5a6450c9af2bfa1594e6dfb43b667027f1930eefddeac7bf05020580dac4090100d802d6017300d602b2a4730100eb027201d195ed93b1a4730293b1db630872027303d809d603db63087202d604b2a5730400d605db63087204d606b27205730500d607b27203730600d608b27205730700d609b27203730800d60a7e8cb2db6308a77309000206d60b7e99730a8cb27203730b000206edededededed93b27203730c008602730d730e93c27204d0720192c1720499c1a7730f938c7206018c720701938c7208018c720901927e8c720602069d9c720a7e8c72070206720b927e8c720802069d9c720a7e8c72090206720b7310",
          "address": "oZfBf79wWTJbR3fqfvksQvzVy7A1rSPTbFdEPCCp7oNoXE6GUwRMVqCBipWdUkMswEHJZZVbpZPXzuJozSBfgCHUT82YVJoHb8dmpebGYWLrLhsaK5vTSCTb5fypvE7vrGRcYAwFd9W8U4Sc71jJxaoqPv3ZM5wPo7ZqDTDr9T3Q8KEDoSfWJCzzyKGpB9CuD9Y4FELCUrbBPkaGcQuvFxnuvcCXDHPHU8gHEfKouA1TWkFGAdvSg5YZPi1Hh9uZUtU3uQk32NWU2wziTqCK7CjefwcG2eyJVPWkvRkXSxa8XPJbym6gqDHy73SkSUdoeUvWC6apSktePJAJMWQ76PdVjv1XzMyLk2GyjUqhuSqfFB1u7Z6eQ8t4yTCtEo7uFVsYMR8jVNTe2NpW8drc16AaGzia4ZKhcqciRsNTHwihwsyL6YiSJN94ghCM1K7eCoX",
          "assets": [
              {
                  "tokenId": "e0588d273c8183865cff31b3bfa766bc7b178e2362b45497b67e79662e3615b7",
                  "index": 0,
                  "amount": 7071
              }
          ],
          "additionalRegisters": {},
          "spentTransactionId": null
      },
      {
          "boxId": "8c919b065c2f06ff94575747b7a9c27ecc64ce636bb4d9f5ac75d5ff738dbc95",
          "transactionId": "a9851a458000d3599449a669f4b9c0bac408f450dfeff89fed7dad2e6780241c",
          "value": 702106098,
          "index": 1,
          "creationHeight": 506880,
          "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
          "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
          "assets": [
              {
                  "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                  "index": 0,
                  "amount": 1992168830252,
                  "name": "WT_ERG",
                  "decimals": 9,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                  "index": 1,
                  "amount": 217955864962,
                  "name": "WT_ADA",
                  "decimals": 8,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                  "index": 2,
                  "amount": 1000000000,
                  "name": "TUSD",
                  "decimals": 0,
                  "type": "EIP-004"
              },
              {
                  "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                  "index": 3,
                  "amount": 999999900,
                  "name": "TERG",
                  "decimals": 0,
                  "type": "EIP-004"
              }
          ],
          "additionalRegisters": {},
          "spentTransactionId": null
      },
      {
          "boxId": "2e293a7441cb775f0d44f6a87df2bd8e0f2daaec8fbe1132689806242d026b45",
          "transactionId": "a9851a458000d3599449a669f4b9c0bac408f450dfeff89fed7dad2e6780241c",
          "value": 10000000,
          "index": 2,
          "creationHeight": 506880,
          "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          "assets": [],
          "additionalRegisters": {},
          "spentTransactionId": null
      }
  ],
  "size": 958
}`
