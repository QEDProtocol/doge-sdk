import { DogeNetworkId } from "../networks/types";
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
  getPrivateKeyWIF?(): Promise<string>;
}

interface IWalletProviderAbilities {
  addWalletRandom?: boolean;
  addWalletBIP39?: boolean;
  addWalletBIP44?: boolean;
  addWalletBIP178?: boolean;
}

interface IDogeWalletProvider {
  getSigners(): Promise<IDogeTransactionSigner[]>;
  addWalletRandom?(networkId: DogeNetworkId): Promise<IDogeTransactionSigner>;
  addWalletBIP39?(networkId: DogeNetworkId, seedPhrase: string, password?: string): Promise<IDogeTransactionSigner>;
  addWalletBIP44?(networkId: DogeNetworkId, fullDerivationPath: string): Promise<IDogeTransactionSigner>;
  addWalletBIP178?(networkId: DogeNetworkId, wif: string): Promise<IDogeTransactionSigner>;
  getAbilities(): IWalletProviderAbilities;
}

interface IFullDogeWalletProvider<T extends IDogeWalletProvider> extends IDogeWalletProvider {
  getCompressedPublicKeys(useCache?: boolean): Promise<string[]>;
  getSignerForPublicKey(compressedPublicKeyHex: string, useCache?: boolean): Promise<IDogeTransactionSigner>;
  getP2PKHAddresses(networkId: string, useCache?: boolean): Promise<{ address: string; publicKey: string }[]>;
  getSignerForAddress(address: string, useCache?: boolean): Promise<IDogeTransactionSigner>;
  getBaseProvider(): T;
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
  IWalletProviderAbilities,
}