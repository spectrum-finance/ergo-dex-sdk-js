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
          id: "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
          name: "TERG",
          decimals: 0
        },
        100n
      ),
      poolId: "51ee3a4e30d0e763d3f1759be12239b1ff163068a5eae699d2e667f9effb348d",
      to: {
        id: "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776"
      },
      type: "swap"
    }
  ]
  parsed
  expected // todo
  t.deepEqual(1, 1)
})

const txJson = `{
    "id": "baf8a292d214e42436328c7b37dc81f176e4806ed4aee82cce218de8a8b7c549",
    "blockId": "8eb54c3e177d4cbd2ebbe72ce78bb0110e21b6e50438204e99a7472ed4669ec6",
    "inclusionHeight": 540620,
    "timestamp": 1627310068145,
    "index": 1,
    "globalIndex": 1553576,
    "numConfirmations": 580,
    "inputs": [
        {
            "boxId": "cf7d7a76ff7a68f483a9e8e4d0ac0df0ed7dc0821495b5487d5367b68fa32529",
            "value": 1233698000,
            "index": 0,
            "spendingProof": "84f91ddda300d1fbdedd7ece1bf07cdaf593024760349e82929396b08a5c7853130ef755476c3d93e8424cc3cc08f3777aa3bde6fcb7ca0a",
            "outputBlockId": "20930b03ca750874c3d4c5f8273a90aa7dde413266c57150c12ba13c453e0ca8",
            "outputTransactionId": "4655d2caeb7cb5e269cb05f89341442269a0bfbf27b06bccba50ee67e1e0c1c5",
            "outputIndex": 1,
            "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
            "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
            "assets": [
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 0,
                    "amount": 1000000000,
                    "name": "TUSD",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                    "index": 1,
                    "amount": 9000000000,
                    "name": "WT_ADA",
                    "decimals": 8,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                    "index": 2,
                    "amount": 23000000000,
                    "name": "WT_ERG",
                    "decimals": 9,
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
            "boxId": "b33ce0094a6cb1fd4a2ee84b13921ed489de44ed11205c6e3591bb15d593d370",
            "transactionId": "baf8a292d214e42436328c7b37dc81f176e4806ed4aee82cce218de8a8b7c549",
            "blockId": "8eb54c3e177d4cbd2ebbe72ce78bb0110e21b6e50438204e99a7472ed4669ec6",
            "value": 12050000,
            "index": 0,
            "globalIndex": 5743858,
            "creationHeight": 506880,
            "settlementHeight": 540620,
            "ergoTree": "198c031108cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a0400040204000e2030974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e0404040004c80f040604d00f06010104000e20f1fb942ebd039dc782fd9109acdb60aabea4dc7e75e9c813b6528c62692fc78104040596aa93eb0e05d8caa4f1c7c6eb11058080a0f6f4acdbe01bd80ed6017300d602db6308b2a4730100d603b2a5730200d604b2db63087203730300d6057304d6068c720402d6077e720606d608b27202730500d6097e8c72080206d60a7e8cb2db6308a77306000206d60b7307d60c7e8cb272027308000206d60d7309d60e9a7207730aeb027201d1eded938cb27202730b0001730c93b1a4730dedededed93c27203d07201938c7204017205927206730e927ec1720306997ec1a7069d9c72077e730f067e73100695938c7208017205909c9c7209720a7e720b069c720e9a9c720c7e720d069c720a7e720b06909c9c720c720a7e720b069c720e9a9c72097e720d069c720a7e720b06",
            "address": "EPNcS461xwdT5drQxJfoHRPqvQLsvuuJHUBa964oSHwx116u4i9xLjLvDp9VrpfdWGdhJV9bZDrEKzc484Gw94Ws78sR7iMr47fApZpGxTKktxPJRs4ZUXisV75tMT95Tyha1d2D7qpFW2cR1yRGwHKhrnKNBaAs1njAWedU9YrXon3SGWcC6PQ1cZPYKJoZ3YCxdzh3RiYPSrLhmUQtt93AP2eA3PYAsZo7x3Xaokw2isoEj7gos9DR1RNb8SspTKnXwfKfAMVKduX38zhe3xLoxE9LFtwGTU4K7TKj1kQWBjzuUXQYc8dV8QwdzwFLFsFQLnYNrpDiYeDN7uNYivqcusYiYd3VFShtT4rFLFX4sEimvnLyStX8BM5MkBvUCuCt8hSnac21HbHYRWB3xdYK6315i7fYCR92bVmfmSrGVCoPLhJFfwAseZeQ1JSHYLM98wwGW3yHX2m3ScPdRej4Z28XLNX2zPv2a8cYs4Z4LkdN7ratdjV3h4vTmTV8ipLp82zNfzMa6z2Bh8KZx5z5V4z6hSRaFsGh7eH",
            "assets": [
                {
                    "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                    "index": 0,
                    "amount": 1000000000,
                    "name": "WT_ERG",
                    "decimals": 9,
                    "type": "EIP-004"
                }
            ],
            "additionalRegisters": {},
            "spentTransactionId": "6ab329579100d0c1d8db508648a22b40ab3504c03c12480bcd0bf211c2a21c36",
            "mainChain": true
        },
        {
            "boxId": "9a9d3cbf72a5cca85e102763299de8a7069b753fb66a1dfdfec26b588a798c99",
            "transactionId": "baf8a292d214e42436328c7b37dc81f176e4806ed4aee82cce218de8a8b7c549",
            "blockId": "8eb54c3e177d4cbd2ebbe72ce78bb0110e21b6e50438204e99a7472ed4669ec6",
            "value": 1209648000,
            "index": 1,
            "globalIndex": 5743859,
            "creationHeight": 506880,
            "settlementHeight": 540620,
            "ergoTree": "0008cd02c3f56e66191a903758f53a4b90d07cef80f93e7a4f17d106098ad0caf189722a",
            "address": "9g1N1xqhrNG1b2TkmFcQGTFZ47EquUYUZAiWWCBEbZaBcsMhXJU",
            "assets": [
                {
                    "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
                    "index": 0,
                    "amount": 1000000000,
                    "name": "TUSD",
                    "decimals": 0,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
                    "index": 1,
                    "amount": 9000000000,
                    "name": "WT_ADA",
                    "decimals": 8,
                    "type": "EIP-004"
                },
                {
                    "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
                    "index": 2,
                    "amount": 22000000000,
                    "name": "WT_ERG",
                    "decimals": 9,
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
            "spentTransactionId": "569ae48d6c80ee2b1bd5ffcf7779c513802266639f4c09886f2e2e5ee9a303cf",
            "mainChain": true
        },
        {
            "boxId": "462bcfe869271f0d05e763b41e083119bc8bd2aab9221de5972fbdc9a84fa834",
            "transactionId": "baf8a292d214e42436328c7b37dc81f176e4806ed4aee82cce218de8a8b7c549",
            "blockId": "8eb54c3e177d4cbd2ebbe72ce78bb0110e21b6e50438204e99a7472ed4669ec6",
            "value": 12000000,
            "index": 2,
            "globalIndex": 5743860,
            "creationHeight": 506880,
            "settlementHeight": 540620,
            "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
            "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
            "assets": [],
            "additionalRegisters": {},
            "spentTransactionId": "9890a835689780782f7c0b194b1adc600b5925a731efd0c1fa3c8bcb31967d8c",
            "mainChain": true
        }
    ],
    "size": 820
}`
