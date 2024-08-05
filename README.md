<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/QEDProtocol/doge-sdk">
  <img width="256" height="256" src="https://github.com/QEDProtocol/doge-sdk/raw/main/docs/static/doge-sdk-logo.png?raw=true">
  </a>

  <h2 align="center">doge-sdk</h2>
  <p align="center">
An ultra lightweight (20kb gzipped) doge library for Node.js and the Browser with only 1 dependency.
  </p>
  <p align="center">
    Made with ❤️ by <a href="https://qedprotocol.com">QED</a>
  </p>
</div>

## Features
* Works out of the box in Node and the Browser without any polyfills
* only 20kb gzipped ✨
* Support for both P2PKH and P2SH transactions
* Built in Memory Wallet + Support for Hardware Wallets (ledger, trezor, etc.)
* Does not depend on bitcoinjs-lib (no need for a megabyte of nodejs polyfills and global scope pollution)
* Only has pinned one dependency, [@qed-noble/secp256k1](https://github.com/QEDProtocol/noble-secp256k1) which is only 4kb, and has already been [audited](https://cure53.de/pentest-report_noble-lib.pdf).
* Compiler/Assembler for BASM and standard bitcoin assembly


## Installation
```bash
npm install doge-sdk
```

## Usage

### P2PKH
```typescript
import { DogeLinkRPC, DogeMemoryWalletProvider, createP2PKHTransaction } from "doge-sdk";

async function exampleP2PKH(){
  // networkId can be doge, dogeTestnet, or dogeRegtest
  const networkId = "dogeRegtest";

  // your dogecoin rpc node url, with an added query equal to doge, dogeTestnet, or dogeRegtest
  const RPC_API_URL = "http://devnet:devnet@localhost:1337/bitcoin-rpc/?network="+networkId;

  const rpc = new DogeLinkRPC(RPC_API_URL);

  // wallet provider, in this case an in-memory wallet provider
  const walletProvider = new DogeMemoryWalletProvider();

  // create a random dogecoin P2PKH wallet
  const wallet1 = walletProvider.addRandomWallet(networkId);
  console.log("wallet 1 address: ", wallet1.address);

  // import a wallet from WIF
  const wallet2 = walletProvider.addWalletFromWIF("cN1CE8kQ3QADHeumGSVvMBNaqMZUyNnKmURqEryYzNDorB7xRRab");
  console.log("wallet 2 address: ", wallet2.address);

  // in dogeRegtest, we can faucet tokens to any address we like after mining some blocks
  await rpc.mineBlocks(200);
  // faucet 10 DOGE to the wallet
  const faucetTxid = await rpc.sendFromWallet(wallet1.address, 10);

  // send 9.5 DOGE from wallet1 to wallet2
  // get the funding transaction
  const faucetFundingTx = await rpc.getTransaction(faucetTxid);
  // get the unspent transaction output for wallet 1
  const faucetUTXO = faucetFundingTx.getUTXOsForAddress(wallet1.address)[0];
  // create a transaction which sends 9.5 DOGE from wallet1 to wallet2
  const txBuilder = createP2PKHTransaction(wallet1, {
    inputs: [faucetUTXO],
    outputs: [{address: wallet2.address, value: 900_500_000}],
    address: wallet1.address,
  });

  // sign the transaction
  const finalizedTx = await txBuilder.finalizeAndSign();

  // broadcast the transaction
  const txid = await rpc.sendRawTransaction(finalizedTx.toHex());
  console.log("transaction id: ", txid);
}
```

### Simple P2SH Puzzle
```typescript
import { DogeLinkRPC, DogeMemoryWalletProvider, createP2SHTransaction, getP2SHAddress } from "doge-sdk";

async function exampleP2SH(){
  // networkId can be doge, dogeTestnet, or dogeRegtest
  const networkId = "dogeRegtest";

  // note: if you don't have an RPC node, you can start one up with docker:
  // docker run -p 1337:1337 -it --rm qedprotocol/bitide-doge:latest

  // your dogecoin rpc node url, with an added query equal to doge, dogeTestnet, or dogeRegtest
  const RPC_API_URL = "http://devnet:devnet@localhost:1337/bitcoin-rpc/?network="+networkId;

  const rpc = new DogeLinkRPC(RPC_API_URL);

  // a simple puzzle utxo that can be unlocked by solving the equation x + 5 = 7
  const REDEEM_SCRIPT = `
    <5>
    OP_ADD
    <7>
    OP_EQUAL
  `;

  // the unlock script that solves the equation x + 5 = 7, where x = 2
  const UNLOCK_SCRIPT = `
    <2>
  `;

  // compute the pay-to-script-hash address for our puzzle
  const p2shAddress = getP2SHAddress(REDEEM_SCRIPT, networkId);
  console.log("pay-to-script-hash address: ", p2shAddress);

  // in dogeRegtest, we can faucet tokens to any address we like after mining some blocks
  await rpc.mineBlocks(200);
  // faucet 10 DOGE to the P2SH address
  const faucetTxid = await rpc.sendFromWallet(p2shAddress, 10);

  // create a random dogecoin P2PKH wallet to send the puzzle's reward to
  const walletProvider = new DogeMemoryWalletProvider();
  const wallet1 = walletProvider.addRandomWallet(networkId);
  console.log("wallet 1 address: ", wallet1.address);

  // -- unlock the puzzle and spend 9.5 DOGE from the puzzle to wallet1 --
  // get the funding transaction
  const faucetFundingTx = await rpc.getTransaction(faucetTxid);
  // get the unspent transaction output for the puzzle p2sh script
  const faucetUTXO = faucetFundingTx.getUTXOsForAddress(p2shAddress)[0];

  // create a transaction which sends 9.5 DOGE from the puzzle script to wallet1
  const p2shTxBuilder = createP2SHTransaction({
    redeemScriptBASM: REDEEM_SCRIPT,
    unlockScriptBASM: UNLOCK_SCRIPT,
    inputs: [faucetUTXO],
    outputs: [{address: wallet1.address, value: 950_000_000}],
  });

  // finalize the transaction
  const finalizedTx = await p2shTxBuilder.finalizeAndSign();

  // broadcast the transaction
  const txid = await rpc.sendRawTransaction(finalizedTx.toHex());
  console.log("transaction id: ", txid);
}
```

### Complex P2SH Puzzle with Signature + Secret Preimage Reveal
```typescript
import { DogeLinkRPC, DogeMemoryWalletProvider, createP2PKHTransaction, createP2SHTransaction, getP2SHAddress, hashBuffer } from "doge-sdk";


async function exampleComplexP2SH(){
  /*
   * Wallet 1 -> sign(P2SH Puzzle, Wallet 2) -> Wallet 3
   */
  // networkId can be doge, dogeTestnet, or dogeRegtest
  const networkId = "dogeRegtest";

  // note: if you don't have an RPC node, you can start one up with docker:
  // docker run -p 1337:1337 -it --rm qedprotocol/bitide-doge:latest

  // your dogecoin rpc node url, with an added query equal to doge, dogeTestnet, or dogeRegtest
  const RPC_API_URL = "http://devnet:devnet@localhost:1337/bitcoin-rpc/?network="+networkId;

  const rpc = new DogeLinkRPC(RPC_API_URL);

  // create some wallets, wallet 1 will sign the tx and wallet 2 will receive the funds
  const walletProvider = new DogeMemoryWalletProvider();
  const wallet1 = walletProvider.addRandomWallet(networkId);
  console.log("wallet 1 address: ", wallet1.address);
  const wallet2 = walletProvider.addRandomWallet(networkId);
  console.log("wallet 2 address: ", wallet2.address);
  const wallet3 = walletProvider.addRandomWallet(networkId);
  console.log("wallet 3 address: ", wallet3.address);

  // create a secret string and hash it
  const secretString = "hello world";
  const secretStringHashHex = hashBuffer("hash160", new TextEncoder().encode(secretString), "hex");

  
  // hash the public key of wallet2
  const pubKeyHashHex = hashBuffer("hash160", wallet2.compressedPublicKey, "hex")


  // a more complex puzzle utxo that can be unlocked by providing the secret string "hello world" and a signature from wallet2
  const REDEEM_SCRIPT = `
    OP_HASH160
    <0x${secretStringHashHex}>
    OP_EQUALVERIFY 

    OP_DUP
    OP_HASH160
    <0x${pubKeyHashHex}>
    OP_EQUALVERIFY
    OP_CHECKSIG
  `;
  // our unlock script will contain the secret string and a signature from wallet2
  // (the signature will be added automatically when we run finalizeAndSign)
  const UNLOCK_SCRIPT = `
    <"${secretString}">
  `;

  // compute the pay-to-script-hash address for our puzzle
  const p2shAddress = getP2SHAddress(REDEEM_SCRIPT, networkId);
  console.log("pay-to-script-hash address: ", p2shAddress);


  // in dogeRegtest, we can faucet tokens to any address we like after mining some blocks
  await rpc.mineBlocks(200);
  // faucet 10 DOGE to wallet1
  
  const faucetTxid = await rpc.sendFromWallet(wallet1.address, 10);
  await rpc.mineBlocks(1);

  // -- STEP 1: send 9.9 DOGE from wallet1 to the puzzle script --
  // get the funding transaction
  const faucetFundingTx = await rpc.getTransaction(faucetTxid);
  // get the unspent transaction output for wallet 1
  const faucetUTXO = faucetFundingTx.getUTXOsForAddress(wallet1.address)[0];
  // create a transaction which sends 9.9 DOGE from wallet1 to wallet2
  const txBuilder1 = createP2PKHTransaction(wallet1, {
    inputs: [faucetUTXO],
    outputs: [{address: p2shAddress, value: 990_000_000}],
    address: wallet1.address,
  });
  // finalize the transaction
  const finalizedTx1 = await txBuilder1.finalizeAndSign();

  // broadcast the transaction
  const txid1 = await rpc.sendRawTransaction(finalizedTx1.toHex());
  console.log("(send from wallet 1 to p2sh script) transaction id: ", txid1);

  await rpc.mineBlocks(1);

  // -- unlock the puzzle and spend 9.8 DOGE from the puzzle to wallet3 --
  // get the p2sh funding transaction
  const p2shFundingTx = await rpc.getTransaction(txid1);
  // get the unspent transaction output for the puzzle p2sh script
  const p2shUTXO = p2shFundingTx.getUTXOsForAddress(p2shAddress)[0];
  console.log("p2shUTXO",faucetUTXO);

  // create a transaction which sends 9.8 DOGE from the puzzle script to wallet1
  const p2shTxBuilder = createP2SHTransaction({
    redeemScriptBASM: REDEEM_SCRIPT,
    unlockScriptBASM: UNLOCK_SCRIPT,
    inputs: [p2shUTXO],
    outputs: [{address: wallet3.address, value: 980_000_000}],
    // wallet2 will sign the transaction
    signers: [wallet2],
  });

  // finalize the transaction
  const finalizedTx = await p2shTxBuilder.finalizeAndSign();

  // broadcast the transaction
  const txid = await rpc.sendRawTransaction(finalizedTx.toHex());
  console.log("(send from the p2sh script to wallet 3) transaction id: ", txid);
}
```

### NodeJS Usage
On Node.js, the usage exactly the same as in the browser, but you need to provide an HTTP transport:
```typescript
import fetch from 'node-fetch';
const httpTransport = new FetchHTTPClient(fetch);
const rpc = new DogeLinkRPC("http://devnet:devnet@localhost:1337/bitcoin-rpc/?network=dogeRegtest", httpTransport);
```

If you don't want to use node-fetch, you can also implement `IDogeHTTPClient` with the HTTP client of your choice:
```typescript
interface ISimpleHTTPRequest {
  url: string;
  method: string;
  credentials?: "include" | "omit" | "same-origin";
  headers?: Record<string, string>;
  body?: string | ArrayBuffer;
  responseType: "text" | "json" | "arraybuffer";
}
interface ISimpleHTTPResponse {
  statusCode: number;
  body: any;
}

interface IDogeHTTPClient {
  sendRequest(request: ISimpleHTTPRequest): Promise<ISimpleHTTPResponse>;
}

class MyHttpTransport implements IDogeHTTPClient {
  async sendRequest(request: ISimpleHTTPRequest): Promise<ISimpleHTTPResponse> {
    // ...
  }
}

const httpTransport = new MyHttpTransport();
const rpc = new DogeLinkRPC("http://devnet:devnet@localhost:1337/bitcoin-rpc/?network=dogeRegtest", httpTransport);
```

### Hardware/Third Party Wallet Support
To implement a hardware wallet you need to implement the interfaces `IDogeTransactionSigner` and `IDogeWalletProvider` (see [src/wallet/types.ts](./src/wallet/types.ts)).

You can find an end-to-end example of implementing a doge wallet provider for ledger in [docs/ThirdPartyWallets.md](./docs/ThirdPartyWallets.md). 

## FAQ
### How do I get a doge RPC API URL
To test out the library, you will need a doge RPC API node, you can spin one up locally along with a block explorer + electrs API by running:
```bash
docker run -p 1337:1337 -it --rm qedprotocol/bitide-doge:latest
```


## TODO
* Add more unit tests
* Support Bitcoin compatible PSBT (instead of using TransactionBuilder)
* Perform Audit


## License
MIT License

Copyright (c) 2024 Zero Knowledge Labs Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/QEDProtocol/doge-sdk.svg?style=for-the-badge
[contributors-url]: https://github.com/QEDProtocol/doge-sdk/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/QEDProtocol/doge-sdk.svg?style=for-the-badge
[forks-url]: https://github.com/QEDProtocol/doge-sdk/network/members
[stars-shield]: https://img.shields.io/github/stars/QEDProtocol/doge-sdk.svg?style=for-the-badge
[stars-url]: https://github.com/QEDProtocol/doge-sdk/stargazers
[issues-shield]: https://img.shields.io/github/issues/QEDProtocol/doge-sdk.svg?style=for-the-badge
[issues-url]: https://github.com/QEDProtocol/doge-sdk/issues
