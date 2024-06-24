# Third Party / Hardware Wallet Support

Implementing hardware wallet support for doge-sdk is easy, just implement the interface:

```typescript

interface ISignatureResult {
  publicKey: string;
  signature: string;
}

interface IDogeSignatureRequest {
  transaction: Transaction;
  sigHashType: number;
  inputIndex: number;
}

interface IDogeTransactionSigner {
  getCompressedPublicKey(): Promise<string>;
  canSignHash(): boolean;
  signHash(hashHex: string): Promise<ISignatureResult>;
  signTransaction(signatureRequest: IDogeSignatureRequest): Promise<ISignatureResult>;
}

interface IDogeWalletProvider {
  getSigners(): Promise<IDogeTransactionSigner[]>;
}

```


## Ledger Reference Implementation
For example, here is a reference implementation for a Ledger hardware wallet:
```typescript
import {
  DogeLinkRPC,
  IDogeTransactionSigner,
  IDogeWalletProvider,
  ISignatureResult,
  Transaction,
  compressPublicKey,
  hexToU8Array,
  u8ArrayToHex,
  u8ArrayToHexReversed,
  disassembleScript,
  IDogeSignatureRequest,
} from "doge-sdk";
import LedgerBitcoinApp from "@ledgerhq/hw-app-btc";

class LedgerHardwareWalletSigner implements IDogeTransactionSigner {
  walletPath: string;
  ledgerInstance: LedgerBitcoinApp;
  cachedPublicKey: string = "";
  rpc: DogeLinkRPC;
  constructor(
    walletPath: string,
    rpc: DogeLinkRPC,
    ledgerInstance: LedgerBitcoinApp
  ) {
    this.walletPath = walletPath;
    this.ledgerInstance = ledgerInstance;
    this.rpc = rpc;
  }
  async getCompressedPublicKey(): Promise<string> {
    if (this.cachedPublicKey) {
      return this.cachedPublicKey;
    }
    const ledgerResponse = await this.ledgerInstance.getWalletPublicKey(
      this.walletPath,
      { format: "legacy" }
    );
    const compressedPublicKey = compressPublicKey(
      hexToU8Array(ledgerResponse.publicKey)
    );
    const compressedPublicKeyHex = u8ArrayToHex(compressedPublicKey);
    this.cachedPublicKey = compressedPublicKeyHex;
    return compressedPublicKeyHex;
  }
  canSignHash(): boolean {
    return false;
  }
  signHash(_hashHex: string): Promise<ISignatureResult> {
    // we don't have to implement this method since we can sign the transaction directly
    throw new Error("Method not implemented.");
  }
  async signP2PKHTransaction(
    signatureRequest: IDogeSignatureRequest
  ): Promise<ISignatureResult> {
    const tx = signatureRequest.transaction;
    const inputs: [any, number, undefined, undefined][] = await Promise.all(
      tx.inputs.map(async (input) => {
        const rawHex = await this.rpc.getRawTransaction(
          u8ArrayToHexReversed(input.hash)
        );
        return [
          this.ledgerInstance.splitTransaction(rawHex, false),
          input.index,
          undefined,
          undefined,
        ];
      })
    );

    const splitPreimage = this.ledgerInstance.splitTransaction(
      tx.toHex(),
      false
    );
    const ledgerResponse = await this.ledgerInstance.createPaymentTransaction({
      inputs: inputs,
      associatedKeysets: [this.walletPath],
      outputScriptHex: this.ledgerInstance
        .serializeTransactionOutputs(splitPreimage)
        .toString("hex"),
      additionals: [],
      segwit: false,
      sigHashType: signatureRequest.sigHashType,
      lockTime: tx.locktime,
    });
    const decodedLedgerTx = Transaction.fromHex(ledgerResponse);
    const disAsm = disassembleScript(
      decodedLedgerTx.inputs[signatureRequest.inputIndex].script
    );
    const [signatureBase, publicKey] = disAsm.split(" ").slice(0, 2);
    // remove sighash type from signature
    const signature = signatureBase.substring(0, signatureBase.length - 2);

    return {
      publicKey,
      signature,
    };
  }
  async signP2SHTransaction(
    signatureRequest: IDogeSignatureRequest
  ): Promise<ISignatureResult> {
    const tx = signatureRequest.transaction;
    const publicKey = await this.getCompressedPublicKey();

    const inputs: [
      any,
      number,
      string | null | undefined,
      number | null | undefined
    ][] = await Promise.all(
      tx.inputs.map(async (input) => {
        const rawHex = await this.rpc.getRawTransaction(
          u8ArrayToHexReversed(input.hash)
        );
        const script =
          input.script.length === 0 ? undefined : u8ArrayToHex(input.script);
        return [
          this.ledgerInstance.splitTransaction(rawHex, false),
          input.index,
          script,
          input.sequence,
        ];
      })
    );

    const splitPreimage = this.ledgerInstance.splitTransaction(
      tx.toHex(),
      false
    );

    const signatures = await this.ledgerInstance.signP2SHTransaction({
      inputs: inputs,
      associatedKeysets: [this.walletPath],
      outputScriptHex: this.ledgerInstance
        .serializeTransactionOutputs(splitPreimage)
        .toString("hex"),
      segwit: false,
      sigHashType: signatureRequest.sigHashType,
      lockTime: tx.locktime,
      transactionVersion: tx.version,
    });

    const signature = signatures[0];

    return {
      publicKey,
      signature,
    };
  }
  async signTransaction(
    signatureRequest: IDogeSignatureRequest
  ): Promise<ISignatureResult> {
    if (signatureRequest.transaction.getSigHashConfig().isP2PKH) {
      return this.signP2PKHTransaction(signatureRequest);
    } else {
      return this.signP2SHTransaction(signatureRequest);
    }
  }
}
class LedgerHardwareWalletProvider implements IDogeWalletProvider {
  numberOfWallets: number;
  ledgerInstance: LedgerBitcoinApp;
  signers: LedgerHardwareWalletSigner[] = [];
  rpc: DogeLinkRPC;

  constructor(
    rpc: DogeLinkRPC,
    ledgerInstance: LedgerBitcoinApp,
    numberOfWallets = 8
  ) {
    this.ledgerInstance = ledgerInstance;
    this.numberOfWallets = numberOfWallets;
    for (let i = 0; i < numberOfWallets; i++) {
      this.signers.push(
        new LedgerHardwareWalletSigner(
          "44'/0'/" + i + "'/0/0",
          rpc,
          ledgerInstance
        )
      );
    }
    this.rpc = rpc;
  }

  getSigners(): Promise<IDogeTransactionSigner[]> {
    return Promise.resolve(this.signers);
  }
}
export { LedgerHardwareWalletProvider, LedgerHardwareWalletSigner };
```

## Reference Implementation Usage
For reference, the code below shows how to use the ledger hardware wallet provider, it is no different than using any other signer, such as the included memory wallet!
```typescript
import {
  DogeLinkRPC,
  DogeMemoryWalletProvider,
  FullDogeWalletProvider,
  createP2PKHTransaction,
} from "doge-sdk";
import LedgerBitcoinApp from "@ledgerhq/hw-app-btc";

// you can use what ever transport you like, for example webusb
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

// the provider from above
import { LedgerHardwareWalletProvider } from "./ledgerSigner";

async function exampleP2PKHLedger() {
  // initialize the ledger transport
  const transport = await TransportWebUSB.create();

  // create a new instance of the LedgerBitcoinApp provided by @ledgerhq/hw-app-btc
  const ledgerBitcoinApp = new LedgerBitcoinApp({ transport: transport });

  // networkId can be doge, dogeTestnet, or dogeRegtest
  const networkId = "dogeRegtest";
  const RPC_API_URL =
    "http://devnet:devnet@localhost:1337/bitcoin-rpc/?network=" + networkId;

  // create an RPC instance to interact with the dogecoin network
  const rpc = new DogeLinkRPC(RPC_API_URL);

  // create a new instance of the LedgerHardwareWalletProvider, passing in the RPC instance and the LedgerBitcoinApp instance
  // we wrap the instance in a FullDogeWalletProvider to provide additional functionality
  const provider = new FullDogeWalletProvider(
    new LedgerHardwareWalletProvider(rpc, ledgerBitcoinApp, 8)
  );
  const addresses = await provider.getP2PKHAddresses(networkId);
  // our ledger's wallet address
  const ledgerAddress = addresses[0].address;
  // get the signer instance for the ledger address
  const ledgerSigner = await provider.getSignerForAddress(ledgerAddress);

  // generate a random recipient address for our transaction
  const recipientAddress = new DogeMemoryWalletProvider().addRandomWallet(
    networkId
  ).address;

  // in dogeRegtest, we can faucet tokens to any address we like after mining some blocks
  await rpc.mineBlocks(200);
  // faucet 10 DOGE to the wallet
  const faucetTxid = await rpc.sendFromWallet(ledgerAddress, 10);

  // send 9.5 DOGE from wallet1 to wallet2
  // get the funding transaction
  const faucetFundingTx = await rpc.getTransaction(faucetTxid);
  // get the unspent transaction output for wallet 1
  const faucetUTXO = faucetFundingTx.getUTXOsForAddress(ledgerAddress)[0];
  // create a transaction which sends 9.5 DOGE from our ledger wallet to recipientAddress
  const txBuilder = createP2PKHTransaction(ledgerSigner, {
    inputs: [faucetUTXO],
    outputs: [{ address: ledgerAddress, value: 900_500_000 }],
    address: recipientAddress,
  });

  // sign the transaction
  const finalizedTx = await txBuilder.finalizeAndSign();
  const txid = await rpc.sendRawTransaction(finalizedTx.toHex());
  console.log("Transaction id: ", txid);
}
```
