import test from "ava"
import {RustModule} from "../../utils/rustLoader"
import {DefaultAmmOpsParser} from "./ammOpsParser"
import {AssetAmount, BoxId, ErgoTx} from "../../ergo"
import {OperationSummary} from "../models/operationSummary"
import JSONBigInt from "json-bigint"
import {fixErgoTx} from "../../ergo/entities/ergoTx"

test.before(async () => {
  await RustModule.load(true)
})

const JSONBI = JSONBigInt({useNativeBigInt: true})

const parser = new DefaultAmmOpsParser()

test("parse swap", t => {
  const tx: ErgoTx = fixErgoTx(JSONBI.parse(txJson))
  const parsed = parser.parse(tx)
  const expected: [OperationSummary, BoxId] = [
    {
      from: new AssetAmount(
        {
          id: "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
          name: "TERG",
          decimals: 0
        },
        100n
      ),
      poolId: "51ee3a4e30d0e763d3f1759be12239b1ff163068a5eae699d2e667f9effb348d",
      to: {
        id: "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776"
      }
    },
    "bdb07b0c71ba1977df53c5287a5c30550e6ec9cd657ce3c4c7d6fda55d15d9d9"
  ]
  t.deepEqual(parsed, expected)
})

const txJson = `{
    "id": "4c8d0755d596c41163bd80e8268767a3f0c028e03659664d2e16a3ea0bf00988",
    "blockId": "445e9d94dc4219a77cb8add560d7d33b50a6a503385d4dabf2fdd6a93aa648f3",
    "inclusionHeight": 528945,
    "timestamp": 1625904859544,
    "index": 1,
    "globalIndex": 1505216,
    "numConfirmations": 1548,
    "inputs": [
        {
            "boxId": "3e4f0805ba950efc57a7becce37f46daec07f0846c85f5a24356e673b6174ede",
            "value": 2000000000,
            "index": 0,
            "spendingProof": "b0905b5c11749809a0fa2be84567773f1aec2149d905371ee2df4ac243e9c6e487bedd1caa0e7fb0775f6fbc9fc4c3e80693a68bfa93cb63",
            "outputBlockId": "192196e2f3d0cb786b7ff1ac9ea52b93c605977890b4ee1e470b7b63d38c9e15",
            "outputTransactionId": "5dd977f374d56c0353d4c1d7981fd2b8b807906fe3fdcabde6451cba9bfc1e60",
            "outputIndex": 0,
            "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
            "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
            "assets": [],
            "additionalRegisters": {}
        },
        {
            "boxId": "508f913525446b794f9a53b31b368c277eb5c875ff15809d8d73754ebb09b70a",
            "value": 1000000,
            "index": 1,
            "spendingProof": "04fde77ffd8e8eaa1b4c709ef4a53eee548904d2cd5dc29bfc598f45f5be0e6656f0d0b082976c18494e72462a83d41a17f203802ab8e789",
            "outputBlockId": "1ca49a9cfadf9144069350fa75cf1d0c08d4fd78107874b1e17f864d746f7895",
            "outputTransactionId": "ad18b1670309287c2ac23e9550b357ec91d04c5c20e23d7c37a47514ad29e9f6",
            "outputIndex": 0,
            "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
            "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
            "assets": [
                {
                    "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                    "index": 0,
                    "amount": 1000000000,
                    "name": "TERG",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 1,
                    "amount": 1000000000,
                    "name": "TUSD",
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
            "boxId": "bdb07b0c71ba1977df53c5287a5c30550e6ec9cd657ce3c4c7d6fda55d15d9d9",
            "transactionId": "4c8d0755d596c41163bd80e8268767a3f0c028e03659664d2e16a3ea0bf00988",
            "blockId": "445e9d94dc4219a77cb8add560d7d33b50a6a503385d4dabf2fdd6a93aa648f3",
            "value": 19702000,
            "index": 0,
            "globalIndex": 5360720,
            "creationHeight": 508928,
            "settlementHeight": 528945,
            "ergoTree": "19a0031008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a040004040e20f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e7760406040004d00f04c60f04c60f04000e2051ee3a4e30d0e763d3f1759be12239b1ff163068a5eae699d2e667f9effb348d0400050205f6990105a01f0502d810d6017300d602db6308b2a4730100d603b27202730200d6048c720301d6057303d606b27202730400d6078c720601d608b2db6308a7730500d6098c720801d60a7e8c72060206d60b7306d60c8c720802d60d7e9c720c7e73070506d60e7e8c72030206d60f7e720c06d6107308eb027201d1ededed938cb2720273090001730aec93720472059372077205ec93720472099372077209aea5d9011163d803d613b2db63087211730b00d6148c721302d6159a7214730cedededed93c27211d07201938c7213017205927214730d92c1721199c1a79d9c7214730e730f959372047205909c9c720e720f7e7210069c7e7215069a9c720a7e720b06720d909c9c720a720f7e7210069c7e7215069a9c720e7e720b06720d",
            "address": "pkDP724jXzKoBhpgt1PfqN9DVNrB5iHiV2mQeoXSojmBijkiVn3qNFp5zpDVmYiac8MhvFsrosfUHj2itgVFJp9W8wcJe5AFyiBUGogXKgB2P83TbJ6A5V8ZFx1FdQoeCrJwXEtuNfke9okBKboJPEg2LSDDcgX93QY8X8md25VhqGTq19ULUeK6T5RTbQD5Jk8RVrDu3KcNb322GGTLJUaDFTdeYRAnv8rXxR1fgYsjJCPoMYVBo4rzBotprUD4wxcUbY4ozkqiUDkztJAqkdsRAP1kPxhRjTuLExmUGjjVp4ZahfqByJpFv7KhsEMjVa88dKypfwvG65EjinJM5sAFfuQGAfHUXxsW3u6e78zrVwLxWoFDTjuEU8RWjuLbstgzibHbt96JMfT6Uq64oLwNNN6wbCCJKf8Ncorsv1R4UWb3EAy3674p1mmnNenSGk6eyLLxEiXUk1UqZrqnibaRiAisA5e4779kzGLdCcvgy9u7ARq83bbnHbeVWa3niXnUedgF8MqxTWadRPftXxhEMy3MFJQ9Admn57YiG26RQZwcu9vrC89Dsid6wMPzjY",
            "assets": [
                {
                    "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                    "index": 0,
                    "amount": 100,
                    "name": "TERG",
                    "decimals": 0,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {},
            "spentTransactionId": null,
            "mainChain": true
        },
        {
            "boxId": "0b50b3c09d13882edd1c686b8a3ce9c78f2b675bac546d4e02dba76ca5ac1c76",
            "transactionId": "4c8d0755d596c41163bd80e8268767a3f0c028e03659664d2e16a3ea0bf00988",
            "blockId": "445e9d94dc4219a77cb8add560d7d33b50a6a503385d4dabf2fdd6a93aa648f3",
            "value": 1971298000,
            "index": 1,
            "globalIndex": 5360721,
            "creationHeight": 508928,
            "settlementHeight": 528945,
            "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
            "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
            "assets": [
                {
                    "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
                    "index": 0,
                    "amount": 999999900,
                    "name": "TERG",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 1,
                    "amount": 1000000000,
                    "name": "TUSD",
                    "decimals": 0,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {},
            "spentTransactionId": null,
            "mainChain": true
        },
        {
            "boxId": "58dc381e5bc549bf14a6d3de0464bdf50767796586f1677924cd7d00740f3bc8",
            "transactionId": "4c8d0755d596c41163bd80e8268767a3f0c028e03659664d2e16a3ea0bf00988",
            "blockId": "445e9d94dc4219a77cb8add560d7d33b50a6a503385d4dabf2fdd6a93aa648f3",
            "value": 10000000,
            "index": 2,
            "globalIndex": 5360722,
            "creationHeight": 508928,
            "settlementHeight": 528945,
            "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
            "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
            "assets": [],
            "additionalRegisters": {},
            "spentTransactionId": "6c9cc9e31f39930dc358d50143c447507b4a3a703677efebba8ba83377d08e00",
            "mainChain": true
        }
    ],
    "size": 850
}`
