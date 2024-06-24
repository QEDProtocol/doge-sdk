import { DogeNetworkId } from "../../networks/types";
import { IDogeTransactionSigner, IDogeWalletProvider, IDogeWalletSerialized } from "../types";
import { DogeMemoryWallet } from "./wallet";

class DogeMemoryWalletProvider implements IDogeWalletProvider {
  wallets: DogeMemoryWallet[];
  constructor(wallets: DogeMemoryWallet[] = []) {
    this.wallets = wallets;
  }
  getSigners(): Promise<IDogeTransactionSigner[]> {
    return Promise.resolve(this.wallets);
  }
  getCompressedPublicKeys(): Promise<string[]> {
    return Promise.resolve(this.wallets.map(x=>x.compressedPublicKeyHex));
  }
  getSignerForPublicKey(compressedPublicKeyHex: string): IDogeTransactionSigner {
    return this.getWalletForPublicKeyOrThrow(compressedPublicKeyHex);
  }
  addWalletFromWIF(wif: string, networkId?: DogeNetworkId, name?: string) {
    const wallet = DogeMemoryWallet.fromWIF(wif, networkId, name);
    this.wallets.push(wallet);
    return wallet;
  }
  addRandomWallet(networkId: DogeNetworkId, name?: string) {
    const wallet = DogeMemoryWallet.generateRandom(networkId, name);
    this.wallets.push(wallet);
    return wallet;
  }
  addWallet(wallet: DogeMemoryWallet){
    this.wallets.push(wallet);
  }
  removeWallet(addressOrPublicKeyHex: string){
    this.wallets = this.wallets.filter(x=>x.compressedPublicKeyHex !== addressOrPublicKeyHex && x.address !== addressOrPublicKeyHex);
  }
  getWalletForPublicKey(publicKey: string): DogeMemoryWallet | null {
    return this.wallets.find(x=>x.compressedPublicKeyHex === publicKey) ?? null;
  }
  getWalletForPublicKeyOrThrow(publicKey: string): DogeMemoryWallet {
    const result = this.getWalletForPublicKey(publicKey);
    if(result === null){
      throw new Error("Wallet not found for public key "+publicKey);
    }
    return result;
  }
  canSignHash(): boolean {
    return true;
  }
  serialize(): IDogeWalletSerialized[] {
    return this.wallets.map(x=>x.serialize());
  }
  static deserialize(serializedWallets: IDogeWalletSerialized[]){
    return new DogeMemoryWalletProvider(serializedWallets.map(x=>DogeMemoryWallet.deserialize(x)));
  }
  toJSON() {
    return this.serialize();
  }
}

export {
  DogeMemoryWalletProvider,
}
