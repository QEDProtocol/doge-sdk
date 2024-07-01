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
  signHash(hashHex: string, signSha256?: boolean): Promise<ISignatureResult>;
  signTransaction(signatureRequest: IDogeSignatureRequest): Promise<ISignatureResult>;
  getPrivateKeyWIF?(): Promise<string>;
}


type TWalletAbility = "add-wallet-random" | "add-wallet-bip39" | "add-wallet-bip44" | "add-wallet-bip178" | "sign-transaction" | "sign-hash-sha256" | "sign-hash-raw" | "export-private-key-wif";

interface IDogeWalletProvider {
  getSigners(): Promise<IDogeTransactionSigner[]>;
  addWalletRandom?(networkId: DogeNetworkId): Promise<IDogeTransactionSigner>;
  addWalletBIP39?(networkId: DogeNetworkId, seedPhrase: string, password?: string): Promise<IDogeTransactionSigner>;
  addWalletBIP44?(networkId: DogeNetworkId, fullDerivationPath: string): Promise<IDogeTransactionSigner>;
  addWalletBIP178?(networkId: DogeNetworkId, wif: string): Promise<IDogeTransactionSigner>;
  getAbilities(): TWalletAbility[];
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
  TWalletAbility,
}