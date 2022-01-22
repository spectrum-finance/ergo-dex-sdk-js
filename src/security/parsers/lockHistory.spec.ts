import {AugErgoBox, RustModule} from "@ergolabs/ergo-sdk"
import test from "ava"
import {mkLockParser} from "./lockParser"

test.before(async () => {
  await RustModule.load(true)
})

const parser = mkLockParser()

test("parse valid lock", t => {
  const box = SampleOutputs[0]
  const r = parser.parseTokenLock(box)
  t.log(r)
})

const SampleOutputsJson = `[
  {
      "boxId": "2508dca96860f8e18181e017c7ae93e19d0c9b36cbadd90f96a8947db42c0c37",
      "transactionId": "cf0f776a93e0ddfa6c9e0bf80e5aff271092729ea5c61289578ecf6aafedf0a3",
      "blockId": "72114b8879c3e2e0fa7c581c5b8761b92094cd5a734c5422c7b56c88f8befac6",
      "value": 2060000,
      "index": 0,
      "globalIndex": 12245720,
      "creationHeight": 506880,
      "settlementHeight": 669182,
      "ergoTree": "195e03040004000400d802d601b2a5730000d602e4c6a70404ea02e4c6a70508d19593c27201c2a7d802d603b2db63087201730100d604b2db6308a7730200eded92e4c6720104047202938c7203018c720401928c7203028c7204028f7202a3",
      "address": "XqM6yyAmxNgCcRzvutWwtdSvKqqaEtd4cZRsVvJu1xeu4y5T9tZexJpPf1XMMWCZdv8zVK1XUbmM5gjB9KzWXQCMEWJcdNas6HYJFYf47m63kU3xZMHjUA3vNKRZWEj8AvQ75YBUx",
      "assets": [],
      "additionalRegisters": {
          "R4": {
              "serializedValue": "04a00b",
              "sigmaType": "SInt",
              "renderedValue": "720"
          },
          "R5": {
              "serializedValue": "08cd03c6ad2949fb9f1a52c77abca7afa4d65fc46021b1f97c391c224f072e402b0a47",
              "sigmaType": "SSigmaProp",
              "renderedValue": "03c6ad2949fb9f1a52c77abca7afa4d65fc46021b1f97c391c224f072e402b0a47"
          }
      },
      "spentTransactionId": null,
      "mainChain": true
  },
  {
      "boxId": "33af2dde94337f4642b495ec59f0e6b16adf0d73b63e356010dc34eb9576399e",
      "transactionId": "cf0f776a93e0ddfa6c9e0bf80e5aff271092729ea5c61289578ecf6aafedf0a3",
      "blockId": "72114b8879c3e2e0fa7c581c5b8761b92094cd5a734c5422c7b56c88f8befac6",
      "value": 4237389984,
      "index": 1,
      "globalIndex": 12245721,
      "creationHeight": 506880,
      "settlementHeight": 669182,
      "ergoTree": "0008cd03c6ad2949fb9f1a52c77abca7afa4d65fc46021b1f97c391c224f072e402b0a47",
      "address": "9hyJcYmz9sQRqf5oTxHSkYG8KMPpEjJbXNfeLjqKfK2GeNgJSQD",
      "assets": [
          {
              "tokenId": "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
              "index": 0,
              "amount": 26706,
              "name": "SigUSD",
              "decimals": 2,
              "type": "EIP-004"
          },
          {
              "tokenId": "e0588d273c8183865cff31b3bfa766bc7b178e2362b45497b67e79662e3615b7",
              "index": 1,
              "amount": 3326,
              "name": null,
              "decimals": null,
              "type": null
          },
          {
              "tokenId": "f45c4f0d95ce1c64defa607d94717a9a30c00fdd44827504be20db19f4dce36f",
              "index": 2,
              "amount": 999999900,
              "name": "TERG",
              "decimals": 0,
              "type": "EIP-004"
          },
          {
              "tokenId": "ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b",
              "index": 3,
              "amount": 2001856802852070,
              "name": "WT_ERG",
              "decimals": 9,
              "type": "EIP-004"
          },
          {
              "tokenId": "003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0",
              "index": 4,
              "amount": 7550,
              "name": "SigRSV",
              "decimals": 0,
              "type": "EIP-004"
          },
          {
              "tokenId": "f302c6c042ada3566df8e67069f8ac76d10ce15889535141593c168f3c59e776",
              "index": 5,
              "amount": 1000000000,
              "name": "TUSD",
              "decimals": 0,
              "type": "EIP-004"
          },
          {
              "tokenId": "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40",
              "index": 6,
              "amount": 1406432,
              "name": "kushti",
              "decimals": 0,
              "type": "EIP-004"
          },
          {
              "tokenId": "36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1",
              "index": 7,
              "amount": 4,
              "name": "Erdoge",
              "decimals": 0,
              "type": "EIP-004"
          },
          {
              "tokenId": "303f39026572bcb4060b51fafc93787a236bb243744babaa99fceb833d61e198",
              "index": 8,
              "amount": 21000778,
              "name": null,
              "decimals": null,
              "type": null
          },
          {
              "tokenId": "1c51c3a53abfe87e6db9a03c649e8360f255ffc4bd34303d30fc7db23ae551db",
              "index": 9,
              "amount": 484547687518,
              "name": null,
              "decimals": null,
              "type": null
          },
          {
              "tokenId": "fa6326a26334f5e933b96470b53b45083374f71912b0d7597f00c2c7ebeb5da6",
              "index": 10,
              "amount": 43884,
              "name": null,
              "decimals": null,
              "type": null
          },
          {
              "tokenId": "30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e",
              "index": 11,
              "amount": 2860289360791101,
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
      "boxId": "2ddb7fb4274d01dc3a2df06929318d31e42faadb7bb3d9d43fbcb072ad6c7bf4",
      "transactionId": "cf0f776a93e0ddfa6c9e0bf80e5aff271092729ea5c61289578ecf6aafedf0a3",
      "blockId": "72114b8879c3e2e0fa7c581c5b8761b92094cd5a734c5422c7b56c88f8befac6",
      "value": 2000000,
      "index": 2,
      "globalIndex": 12245722,
      "creationHeight": 506880,
      "settlementHeight": 669182,
      "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
      "address": "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
      "assets": [],
      "additionalRegisters": {},
      "spentTransactionId": "c8722188488de4aa23ec646f919b0a55fd8c7a44fce75875d38eff7554708f01",
      "mainChain": true
  }
]`

const SampleOutputs: AugErgoBox[] = JSON.parse(SampleOutputsJson)
