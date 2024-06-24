import { Transaction } from "../transaction";

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

interface IFullDogeWalletProvider extends IDogeWalletProvider {
  getCompressedPublicKeys(useCache?: boolean): Promise<string[]>;
  getSignerForPublicKey(compressedPublicKeyHex: string, useCache?: boolean): Promise<IDogeTransactionSigner>;
  getP2PKHAddresses(networkId: string, useCache?: boolean): Promise<{ address: string; publicKey: string }[]>;
  getSignerForAddress(address: string, useCache?: boolean): Promise<IDogeTransactionSigner>;
}

interface IDogeWalletSerialized {
  wif: string;
  networkId: string;
  name: string;
}

export type {
  ISignatureResult,
  IDogeTransactionSigner,
  IDogeWalletProvider,
  IDogeWalletSerialized,
  IFullDogeWalletProvider,
  IDogeSignatureRequest,
}