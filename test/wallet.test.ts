import { DogeMemoryWallet, DogeMemoryWalletProvider, DogeNetworkId, hashBuffer, hashHex, u8ArrayToHex } from "../src";

interface ITestWalletDataDefinition {
  address: string;
  privateKey: string;
  publicKey: string;
  publicKeyHash: string;
  wif: string;
  networkId: string;
}

const WalletData: ITestWalletDataDefinition[] = [
  {
    "address": "DE7eQNmtUmXc6ARAg1YyeHK9w1MTWRd7Fp",
    "privateKey": "787c1d63cd1dfcc70ab313cd1cfea6e035f3f9db4a0a30743727fccf5b58612d",
    "publicKey": "034ba56b7133ec07e830051663309a9df6364e55c1dca0a99cf332daca31b22831",
    "publicKeyHash": "6272e62106c9d3b0ad7cf76d27ef5b939d79ad7e",
    "wif": "QSeqL1qEzP7av9fJfnupznu8mutk5DVg7aaazh17sDwwLiaTGgkL",
    "networkId": "doge"
  },
  {
    "address": "DFknWifxwWw4bLRsLcGfSuQJUrpS79bvtQ",
    "privateKey": "f25c4eb8a2fb3f85d574a0a8cfe1eca16e1af0ec8674c840457dbc0e363bc265",
    "publicKey": "03de318bc8e76969df2ece3863aab403c5230c3d233bf70193dc62fb4f7aa513e0",
    "publicKeyHash": "74712f465525998da22f47e09a672eab6b1ad22b",
    "wif": "QWjk94asbpN41FS2s2LtAwb5Rry2hMrCeLHDN9yjhAaDuXykWVF7",
    "networkId": "doge"
  },
  {
    "address": "D9fMzsvsfqhPfoe3mZqKsjRiVX4UhHvibz",
    "privateKey": "0d8c873eb9f136a52df459b2d2f8f722bbd24c934435fdc24f4a248ac78fed9f",
    "publicKey": "0330bfbeea2404b26bcfea635c61a726895a935f30e8e9e8a3fe55cd7d97db4d8a",
    "publicKeyHash": "3199e2f101b627482894b9524b6111a641008d58",
    "wif": "QP4xuQ9NFqnawm6d7up15u9tw5g3dUDZbE7dhncgACTnbffQMi1Q",
    "networkId": "doge"
  },
  {
    "address": "DPmKLtbBhGGjb1a13h6PqrDGZGgFSLs8Eq",
    "privateKey": "62dcd4547ce3495d0d6792e87d352e122bf843bc1b20c45a432fe8edd1930665",
    "publicKey": "03563085bd22193e70ae37def40c8a166b0317bff4f57d2798982df76ac39a79e9",
    "publicKeyHash": "cc4bed4dfbd3dd006daada2725cc04e8d1fee7d6",
    "wif": "QRvoYaY3YuNp86pYmGnLzPpEDKrwduusBhY9sK7TKcpZrteX4zik",
    "networkId": "doge"
  },
  {
    "address": "DE1arpjqH43ZTupsMAJdtWd1yoTjq3odSg",
    "privateKey": "ea78a290464536085d320eaa4fe17de06d6ff4742b222596a6274ce8a1f34295",
    "publicKey": "02d3041f868e0dd5be3cd5a150a086a1ca118df772d8812fcd2a87c5400ff5d067",
    "publicKeyHash": "614d71dd57b2761d664e3c07fa1bdd126e6f5e20",
    "wif": "QWUQfEqzRCLaVQjmXdDb9SqZ56kYRdXnRKy6fJjmf9JpYbCXA2YA",
    "networkId": "doge"
  },
  {
    "address": "D5Ke8mWSHqcgwmKSGFadUH11FbL8tTFjmA",
    "privateKey": "bb099b3c6c8297d460fd1e74931b5ee095614c6572bc2742394a10e58169bcab",
    "publicKey": "026c09ff55052c4ad21d1cbbe5ff1a0c548a55cb68e63cab25e9f24603d815660c",
    "publicKeyHash": "01fe88a698ee4245018826c0dcd77f329f9595c8",
    "wif": "QUtCmsUKMRjkGRSY1uYMjjWAmmKdiJ1nSaSTKZMgj46xS2AqQoVd",
    "networkId": "doge"
  },
  {
    "address": "D5vBjUujQ5pcUgiGXBxhv7Nscn17xhfEPi",
    "privateKey": "43904ac482abe1ba2a9182d35137dac19885e5f5fd6e42624d1d43da82773dc8",
    "publicKey": "0202505bd42e824d6a844170d0928b8e3d154fefdf2305d0eddd3a8be290adbf19",
    "publicKeyHash": "08870db9010eccf20289d6bcae85128939bd34df",
    "wif": "QQsxm4oEu7NjZYz5Raxqkf6YbuCML5j6dMW6khi6C8MWYrNxexqb",
    "networkId": "doge"
  },
  {
    "address": "DLpyvXtnsfRUAfGFcduCMn8Pq1BQcEdzMX",
    "privateKey": "a00c38bec746cad1895223c949c1653b20de417a5f3f74881b016f588e6a92c0",
    "publicKey": "0290476c034c44527ef6de42a1dda6db56a0982428471dcfdbcd823380c641388c",
    "publicKeyHash": "ac1500a4b02725052c1287f8ffc2be04ebfefde3",
    "wif": "QTyjpupQc3o2yYkrrDsrLp72UxWXLKykBnRHC9tbmRSEn2efbTQs",
    "networkId": "doge"
  },
  {
    "address": "DRja4hWeCsnZezkStawZo9AhJcCXZ9RC9t",
    "privateKey": "a1f097ac015378fe7523b26c480fdcf14b44306e450f6a07eb4665155b576e30",
    "publicKey": "022041dc6d056186a89ed59433d2df879ab4aac94b7ee170a37f86a3854fe51d17",
    "publicKeyHash": "e1e7a28c9343928a4619ae3849b6c2bd22b29960",
    "wif": "QU3R9Wk8k5MQm2u2t8x86PBZdseV8DUTDWMDk2Pey6TXz6xzeJ7S",
    "networkId": "doge"
  },
  {
    "address": "D8NP9otECx5Di4wpkiV6t5tBwTzxSGKnHy",
    "privateKey": "cf06d4131f9e68dc9246b65ba948e7cc32e2c2d3441843e27a8a56ce3be5c822",
    "publicKey": "021a6588cbc494e29994ab21e2460d98c76b82c42a4a0575d2ab18a231e5709bb0",
    "publicKeyHash": "236ba7137f2aa25ef73f50d1bc5f12e949251a1f",
    "wif": "QVZ4SST9QR2rPbcFqpvQSR2pL5PhWW6FH8dLzidv2AJskFZaFwdM",
    "networkId": "doge"
  },
  {
    "address": "DTTqk2s3XaqBSaduk7CYypWN9X99YjQXfT",
    "privateKey": "f4f9e69fdeb6dc050adab4c5d8791222bcb3dadb96d963be6ad07ebb5147dd52",
    "publicKey": "0249953f797cd267002312eecc289827cec568c41e0fffad3482b7e1659a0ab6e8",
    "publicKeyHash": "f4de519077e95ee1337950da48a73fb3dc9e07ae",
    "wif": "QWpq2vhNWHminx5EWaJLfTGmnXg6TV9KS4a6pS32QrrsZhScdpUR",
    "networkId": "doge"
  },
  {
    "address": "D6cTRszpkNHuKcHXBtFLUHdjjG6xksKzGN",
    "privateKey": "da17386b9bacc1cdf50b60385b7b594a672e287de443912026cc521ae7affb4b",
    "publicKey": "03e2e4531c6bc43e78ba6b2fc847c008aacc5bdce880570061ba11a3d34333031a",
    "publicKeyHash": "1024cb7c9056df21d75b22a8b0a4d20bd5abe851",
    "wif": "QVvZr6EuRTFqTibRv2VNpDbbQuTtFfLSy2vBniTsWazMpojRAeRs",
    "networkId": "doge"
  },
  {
    "address": "DTLgCX4g5z1LKwRzsYqhe8PLT5bG69GgUk",
    "privateKey": "20f4d4ff3c7abff6fa6bb1dd70aee290881cdd1f15181faedca35b4b7eb2ddd0",
    "publicKey": "035f81bd0afd91d44c7bd9a7f1f95ee54b82ea712b363572b737e9e4cd7a018ed2",
    "publicKeyHash": "f38370c47ce805946f69084883b9aeba3ecb4de9",
    "wif": "QPigz3s4dGvE9zj8jRb7Y4LK7KHwBaYR7sjUZouAT7myvwzKi9aH",
    "networkId": "doge"
  },
  {
    "address": "D8ibSjXabi2JUKGTaAqcMZLhfchqbf5Q8j",
    "privateKey": "17c892731f1eb28c82478d1853c007e224d534aea534f708457e51a4d66a72a9",
    "publicKey": "03150313f9700046bade35cd2ddf7c2627f65badb2e58b1be63ffa2902d38c323f",
    "publicKeyHash": "273e3b893076daaa412dceab9bbba892da9ee680",
    "wif": "QPQrnuEiHWLk9R9GVsPfKDLbB9PpsSvQKVLfkAibxdGrTXkzRufK",
    "networkId": "doge"
  },
  {
    "address": "DBaSpQYkb8WqBEuSxz6ZrNqUczKtCoPx6R",
    "privateKey": "96f9e71d3c492f6040f0f5b54a66d923775d87f54c3bc36473f6252708b8fd6c",
    "publicKey": "02dc629eb91855fac12ca1f1a8e046e1bed72c926fe58de0b07ff10ead1414138f",
    "publicKeyHash": "469c14d16422a85713de513cf4d32ddddce6f3e8",
    "wif": "QTg74PjZHYwvLooUKPznrZG7NVf7ys4FS72Fng7KBve2vCj329TK",
    "networkId": "doge"
  },
  {
    "address": "D6jrW8Z2RpnWitF4RNBY4XrDyS2kLDbE1P",
    "privateKey": "78273260aab6d73c45c983077c891cbcfa68002ed62394d51f54a75660612205",
    "publicKey": "02dc58c422563f40cffc6316bd20713634f1e986d6e55373e2d75cb085b3df7a53",
    "publicKeyHash": "118af79b7e6a7b6f37e0b37d1bc7d3fd4005319f",
    "wif": "QSeBvu4TSBDTdsWQSksv7heRRS434nh1frYFSxnYAXLLALjEiunb",
    "networkId": "doge"
  },
  {
    "address": "mzXtnVPAFdUL9zte5GXcNoJkY3NEiUy8sv",
    "privateKey": "3c601179c613a37e8adecc6ff3787d51b21451f2a0e4da45033335bf4beb7ee1",
    "publicKey": "028401cf0e40ed8031ad0ef099d2baa8365a13b68dca6a3f39b0a78513ad797558",
    "publicKeyHash": "d097e0472288fe6a215a26faff358713c9fb9b54",
    "wif": "cPc4d6FrJGY4XHojvweNc1ZQ5XC3MKJ2nk6ytcBBfk8mJHHcu9re",
    "networkId": "dogeRegtest"
  },
  {
    "address": "muCtzbFuRzH8rqmVPhYxsE8DLBhYnLv7V8",
    "privateKey": "cc5db21023e9d6372c01ed0bad8f280a7f450ce310ed5ae261413315f1101135",
    "publicKey": "02880b40b126ccf8bf7b4d2fb1deca6b57c16b2b8311139a3a520fec4b5c42a458",
    "publicKeyHash": "9627849f825a5463b29e2a5987515b883a5d11f2",
    "wif": "cURxmtQao9pxvayMs63wWBPxLb3WM7Zfd1sXgSGZoURi6ZnBxmWU",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mytqEqTgXtst4DLjPb8qrg1yfHBLaQ8zf4",
    "privateKey": "d24b2086bdbb3ce0efea02f7c6ade63cdbabcfa83753eb74d8c662cfab4ba273",
    "publicKey": "0368bb3dbdba9241d669c9cfcfd4be2df9532b99413878936853c80c2c7093439e",
    "publicKeyHash": "c995869118237ef90341e381b94e1aefbff470da",
    "wif": "cUdV4dxuVoCvRK73DUjsXHj3LGcgmMjxy5wJ3G9WbTqeRYEqBfMd",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mgWd2uUa1umkL7GCEB6xVm6brLP14yiEmu",
    "privateKey": "537a2f38d3fb8fa5ec42ecad316da022aec32dc6f58750a943e054c77c2a18a5",
    "publicKey": "03bcbae6e3b9fcf6a0e17104fd1579f8ddaef2b5f3b31b283ce1b53699c9f8239a",
    "publicKeyHash": "0ae80c1fcbc7fc0a7971f0cf675fdc189019a1ed",
    "wif": "cQNyFFaJH5KtLfSRjXW84hu8uHtaxn5TB7HNGiXuEiXvNG5eELM4",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mg1DzSudKEEQBhYFfNs7ZcLTAjKs11K27P",
    "privateKey": "94c40b25ec64fa0188d8cc41e49d03071d0dc87e95d596e50fd24b029806376f",
    "publicKey": "02263dc31c2d6a92a9a20438480730a9c7ec771b0b789448f85b085c5e1fbd99a9",
    "publicKeyHash": "0558bfe9912d34c9454a25ff28c888a1e2765cbe",
    "wif": "cSZtAMFx7ovB62HbsfxHwMLoFMDzDXpZSh3dxRgVSh1jaUGo3mQe",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mxD7iT6vfMv2DE2N7wmpsHrjt7x4N5SQoF",
    "privateKey": "9d76e8145d5a11b6f0f46e2f8b6680416b7249396fc9043e4a937d51210fca97",
    "publicKey": "037c4e614d42e1e192097e0780c5e0910efc863c739823bd2897fe6e89c3e8d8f6",
    "publicKeyHash": "b71a83d48ed17c16d7c10b3b050870c41c3df171",
    "wif": "cSrntaRGopkDjEyGUqxppYMpfZoMA2DSy9YZzYX7YTfKQLRmhFXj",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mpGCqq3PgQzXuQTGfyh8gCE9NYYACm72ZB",
    "privateKey": "0ffa3a8e8248824dc0cedc1359a7ee789bd78f9059b92525ff3063ce72465e8e",
    "publicKey": "03003196e7bdaf07a69247fbbe4432027d668e9fec23d2db770d25d6d65cfa89eb",
    "publicKeyHash": "5fef095bd9f264236ee7d61ad9923a81d0d0bb60",
    "wif": "cN7m1yX6pAhbBxYjd8SpexPc8tXCfHvchCNva4rvVaFMy1kmrMaq",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mpgn9WufL7pbBT9enhhPspbKUdvKP2SQf1",
    "privateKey": "69020d0c5d61097f4e5146950d7e2a363fa32067091d14eed66c117e49f51af7",
    "publicKey": "020245e58f626ba80da15754ff2356e356a4f31b9a0237c4adc9cf6f0bbdabbf95",
    "publicKeyHash": "6494d23b4095f6cc3daaab7f09428c0c6b533ca4",
    "wif": "cR6piV3eDH9XHzcFMS4GLQkmM1URmRTKDdV3KgeWpsnHKMGDhgfa",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mwmYnuwoKgzDYNCAvBy55WR3Z5EJt5JHug",
    "privateKey": "3f438155f925ee7613c2a967ae0dbfd6d38d94d48f4e7d75a07b5850c9ec1920",
    "publicKey": "0276e16a0feb011cbed6ee2b34ec7f908db5ec145015c1021266b2aee634d90c11",
    "publicKeyHash": "b244a21522fef1cef97fbaacb56d3de33a3d409e",
    "wif": "cPhgH1t3obNtyhoF1uhWkQkyjWfQeuPkxbmEaNVzuh5jiy8AY2nX",
    "networkId": "dogeRegtest"
  },
  {
    "address": "n3JovwaEUqDUXSBs9LgZQ2iVNyGwnSsXf1",
    "privateKey": "b489dc2cf3eba9538d06eb32600fd78bfc0377a3b5b8e6de09eaf5da9f8d2b35",
    "publicKey": "0232b550cf8c738bfcd7fc8d1b678f01ac7e4e3f5aa1824fc2c6f21cd20d94b9e4",
    "publicKeyHash": "ef06cb3549a07389a5a8ae66eed09059a81f4a75",
    "wif": "cTdeMmyMaxRvWen57wZxoFAyewagNPx8JCRtsknBqiYC2SvYUiWa",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mvSFJ56K84oXe1HkfdRkEcQ5ncfvY986WW",
    "privateKey": "04b2182c8cf262e41be9efc081237ea90107b27642900b6b0a5acb6145e21a6f",
    "publicKey": "033445442ac02f565924b83bc564435ec6208fc667c2ae8d37239a3fa8e063d97e",
    "publicKeyHash": "a3a5ff825804c5d01e03f728a7b638c580347f8a",
    "wif": "cMjq4Tg1mLx1bzaaAA4JsDRD4AMSdK4GJBhsaE1hVd5zy6aBSDcM",
    "networkId": "dogeRegtest"
  },
  {
    "address": "n4o2ebqxqdNEQtHQF9jSKW2R6CDx1CiWeq",
    "privateKey": "1d7f8d049a5d362c22fe993e262609ba2be634b17f9b8fc4bdb30a84ea5c0f6f",
    "publicKey": "02a18a4ec1433e00c32e2643c100b9b49af0265da469bb67a84de0c6be60b9aca3",
    "publicKeyHash": "ff552ee49868ac2cedcb936ba104729f54149c6b",
    "wif": "cNa3QoXv72isWR7acjADJr9fRkKTKgjm6y6mvbi97xHxdXYLks7b",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mhGKyhti2z9XE5g6wgFLHjXqB3MBwwosvW",
    "privateKey": "392c7bb31b6c118be5a3451d490aa50f34df4280e388da0d4c65888bdbaeb58f",
    "publicKey": "0322d8bf6e5950bc4bee4eb4ab8882940cf9a21de063274dad44c795b1a981b5c9",
    "publicKeyHash": "132c1cdca7ff88889fbc47330d15f8a9a6ce8459",
    "wif": "cPVqftdcjtzZZJZpVRNSQTC12Ydtr9mMH4hqc3iABiZFRSY8krP7",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mnwScgcV9hZ6CPnuv4k9soCwXjg6d9PrS5",
    "privateKey": "084535f8e8f5010b312620d9e6a39d4c8c4e0f4b313ac296cb350e7ea8278e1e",
    "publicKey": "02c5cd6ba4c751ed9a7948e141e4043ea8f9e1cc575c4453d54e19b328deeb0875",
    "publicKeyHash": "516a81425c9a48e5a50d4a6daa01b316fdf3468b",
    "wif": "cMrn5t3bk1hXjhbinGUCEs2FP7ULUYP2SFYvgD8fug3zMZHjz4Dx",
    "networkId": "dogeRegtest"
  },
  {
    "address": "mqY9kT7rCLfhgHGKz5BBdEj6GHu5PjJumc",
    "privateKey": "b67c4a5b0e603e09c45762572d4fd164bf29dabe782c8843503403c3b31aa5a0",
    "publicKey": "02aa85b5330bca27f33c97643a574d1c804e2ae6c014e02b8c62cf72682f337a3b",
    "publicKeyHash": "6deb3c6e0e1ff3c56bf766f140809f329004248e",
    "wif": "cThRsWd9jhXb5VsythfN55Yzr3HJB9zHG5ezXMtK8RYVEfHiiVTW",
    "networkId": "dogeRegtest"
  },
  {
    "address": "n2dhcgAKNKuFsNV7HMGJAfYcL61DKukDRo",
    "privateKey": "8f837641fd1e338486e5db2935e65b25139dc298d6ca9f7fd64568274be45bd9",
    "publicKey": "03cb8a5cd8fe3385a01991d3bb12431421b1aeb78cf900985337dce07b13ea528a",
    "publicKeyHash": "e7a14cc21e18997785987a9e1cc8f9da12c74b05",
    "wif": "cSPfzpNrkAivQzTtTgCACkYjpU8rZagJD2QVNShGRuo8C6ZJRSiE",
    "networkId": "dogeRegtest"
  },
  {
    "address": "nWfdrSmg7MALXZ1cBZFxCwv4wH764siKKp",
    "privateKey": "fbcbd63f30cb7be74cd03b3ff83c4d93e5bee4615cbe605251c20facbd74db10",
    "publicKey": "022313278320c0b7a0cf5b52ffc48c526ac49a60ff787c3e3f71d9de514ae287df",
    "publicKeyHash": "1b228349d040532ad926216eb3857d1421650f2f",
    "wif": "coBRQuy4x4X8e8jtjq252NFoV6zHxrfX7RqdAqzCP3KDcXG3ck9D",
    "networkId": "dogeTestnet"
  },
  {
    "address": "no2LabkzZo9af2YodUUGLEMA4ZFvL2UncW",
    "privateKey": "5380cff5e717a34bfc8cf0fbca6732d04d5a8d71805b5bedb417bfb7a4bea4cd",
    "publicKey": "020eb7ab112f3d34de4475eebe09d188a71e7219fc99aba3e9215a8f0c08180e5f",
    "publicKeyHash": "ce8ed7766093fa761baad8d0e4754efe753df7c1",
    "wif": "chYHJsijk8xCMxWdo6A6PUTTF57CbdYyFBFCMmE6GodjvoTxqK3n",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nbLhjqWFZwCcp7AVakmL938V6s8C675r6j",
    "privateKey": "8829345389ec3b681fdbf64db3d1039cc273c2ef57e9f7b279bc21613644ae4d",
    "publicKey": "0276d980c4304a12a26fe8addf090fcd584baa89613111ad56b8c6f2303aa914be",
    "publicKeyHash": "4e667b7fa57dc4c23ba954fd028362535757947c",
    "wif": "cjJeBQ28yRET22w5AaMYEb1nABRJBb49zM15u3NB9SgyNfSVpSfJ",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nfsVncbfxRe3CUqPSXN9GELGcNJRQcx7qz",
    "privateKey": "fbdb43afca1fb89f289e6580c478e8ba56977413a60fdaed0d101cb527f66c74",
    "publicKey": "0392f7ddc73207b5f66f31b3a4c23a8fa5d1577b6f14d54e284d890326ed64099b",
    "publicKeyHash": "8019e73b20a467c31bbdfbe150619f8b8d582352",
    "wif": "coBYCzJachMYmYBtv2Ep9sLSXaQHUrXs26qEG7XvSy4UsGZ6diDt",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nkn8w8h2XQDfirfRi5AxDMpNsU8ekcPSoX",
    "privateKey": "32ca29cc49263a865ff01631d7c63ae488df3d8137b1b0a9b6f09c79002ea169",
    "publicKey": "0256a9f3b99c4c7ed5e8d9403be3863ff3898e5021ec8c48bdbe151f5479e57da8",
    "publicKeyHash": "b5ef0b881154f813da953fcc6fe19031c2c8e2fa",
    "wif": "cgSh3hpsdPRYw8CDmn3r9UCmYapYLuyn2SYRfWDN81goTrV2Hnt4",
    "networkId": "dogeTestnet"
  },
  {
    "address": "ndvyMbPPNQHtJKSq59aT83uX8Q4PeCyVmp",
    "privateKey": "a9836db8ba91052bb6f74633220b04cec26ddbc3cf1e6a687662e7d4bb5dadaf",
    "publicKey": "02380fb5a818526a9f378235ac065d78a7bca1d594ef12abfbb65f6d2659a8bc53",
    "publicKeyHash": "6ad1e9a52b5d8ae40aa9a417f6db0b2dd06126c7",
    "wif": "ckRUUsj5XYjzaCFXEQBByNSLy6hc6DXYNnmoQYsQKAvToQPYYsnP",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nhZ9UYfjikBx6nkp3EbBUCD2V4s3GL5iiE",
    "privateKey": "541785091bba3b6e5c99d8e821ebb07134b16e0652b4811bff975e158b54ec37",
    "publicKey": "0393173f391fb59a684c89c6049ae01ad11ed557fbe92bd1f5a9fd6339e341be1e",
    "publicKeyHash": "9291b6598f47a28030198a0a53b5d9ad9a8faf1b",
    "wif": "chZRgVU4sknohRdAejjZxxtQhRESTrEMm68Y8mUL1BUmrf1xjsWo",
    "networkId": "dogeTestnet"
  },
  {
    "address": "niMx3hNEpwRNRGwPWJPxABY6rWdBw9uE9p",
    "privateKey": "c7604d583583d7bbdc171f2a707f951b1d4ba804f496556dfd3fe70fb63e9ec3",
    "publicKey": "026207070c01176aee979359d9e49ab3c10ef3467b2c54980374ea1f8df87c33dc",
    "publicKeyHash": "9b6bb8f70aaf874a443bd5f893f13d0d8cf92b57",
    "wif": "cmRXLugc5AHbrTSCSd4kRXsVK8w8rrsACwNupXoRTfYCEe1ypPbj",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nc44qZ2YL6jot5Rcj3yfBLsThMWXrWWLZB",
    "privateKey": "910350708890706c2c6d3c47b0799a8ccc598ebe6b872e5bd3da175377ea8ec5",
    "publicKey": "037ff9147d34f8ad05813463c635ad203f3fb4df2e839b6bb7202beb33c3e2a040",
    "publicKeyHash": "56392626fd7c8b712bac0e9131d76d435fd0e978",
    "wif": "cjbrC8anwuxFZPW4vbC5mMpBPvVjUntr43GKfhai2oHNHApvAi7o",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nmhN5jyh8hVbxZknghyBMZGcxjDv6Dvxrk",
    "privateKey": "6544a15a52357652d175eb54ae18a31194e69a78572974e9e8c082092d9736ff",
    "publicKey": "02bd3fbc4b3e616928839fc8c8ed8fdcc6fe9fb29cd95f7e36712432cdd787d18c",
    "publicKeyHash": "c0001117c0eb5fd6fe3908a4ccf53e9492e512f3",
    "wif": "ci8pCnEaTbTmV8eGLyhbaWYF4jzkSTkrmeTbqQM66aTjodrHAuYp",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nWikpFkQWTLgx1pcJWFgncaJw6KcrYk3ty",
    "privateKey": "614345f62f90bd1eb7836a8c98ed693aa66aae4d639a50d40e59d5afb5b11835",
    "publicKey": "0283c81ec84cb952d9e423be58e33acc2f366f349b7c6a2f00a77954c9b4134e7e",
    "publicKeyHash": "1bb992906ef791e3739b7d84bb1f765a33661f3e",
    "wif": "ci12dQsbZJgrRaJeLJDvSLnEyQj5TRV6PWvLpXpzmcjh5Wza5Tvc",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nd7Zfk31vaMsLSApz9zifqG5Tg9T3xSaZ6",
    "privateKey": "949d6f5a34fb1097e26b43d719a0c91caf91b1a974d06f5b631d97124ad3cadd",
    "publicKey": "0265690058c439210984d92002851737541378a126259f47afa8c30d31f91bc008",
    "publicKeyHash": "61da96e8d672287f9cae4c0f2ba4756b2a90cad0",
    "wif": "cjirJU8XfKH3DeeX5o2NB9NxisFNrvJEBs8NTsjTnYn2UFf9irPG",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nYgiCXCs3eydWtgxhM8ntQLK5BPdKwYCzi",
    "privateKey": "59743e7141f4062f6cbf92a52f1c95fe2952713e152bf461c6e1792ef719fb96",
    "publicKey": "0280f1e660927af95361248307f68f59ff7c27c65beaddd8a030fecce7fdb9b7b1",
    "publicKeyHash": "3146cef04c64e8fbe04419f3eaeed857efa98259",
    "wif": "chjrEtaV1oKdjiTtWz3hCbTLFVCxWwyTtgSMoXCgr5creoT38tS3",
    "networkId": "dogeTestnet"
  },
  {
    "address": "ndAmsYgeZjtf1GTDiFSAybCt5qyTkhHbTm",
    "privateKey": "e44f560a37e4b5b80799774c16307d6f3f9fe77a6b3f7ae12d53873a638b89b2",
    "publicKey": "029c33eb20100b455934991bc37b870b03aa60bfd808289d0c591f03a5fe0fdfef",
    "publicKeyHash": "6276063ca80b962a2f46993e609d4fe57bd43c2b",
    "wif": "cnPmTegbNZNjszFHJgiDNwcVo3wYTno1rXbg9dESkZQozGQjcrad",
    "networkId": "dogeTestnet"
  },
  {
    "address": "nsBzSj6Yqn3nds3fVCXMpcZamn3UzEA5rL",
    "privateKey": "797bc81b518d5fa2fd40ae8be9d590effdd659f1e7738eca9b3b9c3c67260b12",
    "publicKey": "03f272971f04901b8d4433b62286f5f224abf3c5592f1bc48ae1ec703dae680f7b",
    "publicKeyHash": "fc42b2282bc5ad854fa3d68bd5e1d264a98e6806",
    "wif": "cip7P5RFRj2jhpb5AyKTanpuA5RNTetRVoPbngC3nxR9n7mDa3gS",
    "networkId": "dogeTestnet"
  },
  {
    "address": "naBveHmnWefDzGpKfQUpzqZAsxKeTapXNe",
    "privateKey": "56e3e979916e9dc3319d196ffb9fc282e5f61f7529a6685747264ec15e3ca49e",
    "publicKey": "0201d55a9c062e47cd0d7ae884365f528e3334e77b23f579faffcab0723406f3d2",
    "publicKeyHash": "41c5628ef842d236c4dd1347ec520668c2ee79ff",
    "wif": "chesBmkrCqGNexPKW33u7yJxGEiRvJh7aCnEZA6apMZyervr6na7",
    "networkId": "dogeTestnet"
  }
];


function getDogeTestWalletDefinitionFromMemoryWallet(wallet: DogeMemoryWallet): ITestWalletDataDefinition {
  return {
    "address": wallet.address,
    "privateKey": u8ArrayToHex(wallet.privateKey),
    "publicKey": wallet.compressedPublicKeyHex,
    "publicKeyHash": hashBuffer("hash160", wallet.compressedPublicKey, "hex"),
    "wif": wallet.wif,
    "networkId": wallet.networkId,
  };
}
function getRandomMemoryWalletDefinitions(networkId: DogeNetworkId, count: number): ITestWalletDataDefinition[] {
  const wallets: DogeMemoryWallet[] = [];
  for (let i = 0; i < count; i++) {
    wallets.push(DogeMemoryWallet.generateRandom(networkId));
  }
  return wallets.map(x=>getDogeTestWalletDefinitionFromMemoryWallet(x));
}
describe('Wallet Serialization', () => {
  // test wallets for all supported networks
  const allTestWallets = WalletData
    .concat(getRandomMemoryWalletDefinitions("doge", 10))
    .concat(getRandomMemoryWalletDefinitions("dogeRegtest", 10))
    .concat(getRandomMemoryWalletDefinitions("dogeTestnet", 10));

  
    allTestWallets.forEach((wallet) => {
    
  it('import wallet from wif '+wallet.networkId+' '+wallet.address, () => {
    const walletProvider = new DogeMemoryWalletProvider();
    const importedWallet = walletProvider.addWalletFromWIF(wallet.wif);
    expect(importedWallet.address).toEqual(wallet.address);
    expect(importedWallet.wif).toEqual(wallet.wif);
    expect(importedWallet.networkId).toEqual(wallet.networkId);
    expect(importedWallet.compressedPublicKeyHex).toEqual(wallet.publicKey);
    expect(u8ArrayToHex(importedWallet.privateKey)).toEqual(wallet.privateKey);
    expect(hashBuffer("hash160", importedWallet.compressedPublicKey, "hex")).toEqual(wallet.publicKeyHash);
    expect(hashHex("hash160", importedWallet.compressedPublicKeyHex, "hex")).toEqual(wallet.publicKeyHash);
  });
});
});