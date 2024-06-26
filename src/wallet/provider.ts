import {
  decodeAddress,
  encodeAddress,
} from "../address";
import { hashHex } from "../hash";
import { getDogeNetworkById } from "../networks";
import { DogeNetworkId } from "../networks/types";
import { u8ArrayToHex } from "../utils/data";
import {
  IDogeTransactionSigner,
  IDogeWalletProvider,
  IFullDogeWalletProvider,
  TWalletAbility,
} from "./types";

class FullDogeWalletProvider<T extends IDogeWalletProvider> implements IFullDogeWalletProvider<T> {
  base: T;
  cache: { signer: IDogeTransactionSigner; publicKey: string }[] = [];
  useCacheByDefault: boolean;
  constructor(base: T, useCacheByDefault = false) {
    this.base = base;
    this.useCacheByDefault = useCacheByDefault;
  }
  addWalletRandom(networkId: DogeNetworkId): Promise<IDogeTransactionSigner> {
    if(this.base.addWalletRandom){
      return this.base.addWalletRandom(networkId);
    }else{
      throw new Error("addWalletRandom not supported for this provider.");
    } 
  }
  addWalletBIP39(networkId: DogeNetworkId, seedPhrase: string, password?: string | undefined): Promise<IDogeTransactionSigner> {
    if(this.base.addWalletBIP39){
      return this.base.addWalletBIP39(networkId, seedPhrase, password);
    }else{
      throw new Error("addWalletBIP39 not supported for this provider.");
    }
  }
  addWalletBIP44(networkId: DogeNetworkId, fullDerivationPath: string): Promise<IDogeTransactionSigner> {
    if(this.base.addWalletBIP44){
      return this.base.addWalletBIP44(networkId, fullDerivationPath);
    }else{
      throw new Error("addWalletBIP44 not supported for this provider.");
    }
  }
  addWalletBIP178(networkId: DogeNetworkId, wif: string): Promise<IDogeTransactionSigner> {
    if(this.base.addWalletBIP44){
      return this.base.addWalletBIP44(networkId, wif);
    }else{
      throw new Error("addWalletBIP44 not supported for this provider.");
    }
  }
  getAbilities(): TWalletAbility[] {
    return this.base.getAbilities();
  }
  getBaseProvider(): T {
    return this.base;
  }
  shouldUseCache(useCached?: boolean) {
    if (typeof useCached === "undefined") {
      return this.useCacheByDefault && this.cache.length > 0;
    } else if (useCached) {
      return this.cache.length > 0;
    } else {
      return false;
    }
  }
  async getSignerForAddress(
    address: string,
    useCache?: boolean
  ): Promise<IDogeTransactionSigner> {
    const { hash } = decodeAddress(address);
    const hexHash = u8ArrayToHex(hash).toLowerCase();
    if (this.shouldUseCache(useCache)) {
      const existingHashes = this.cache.map((x) =>
        hashHex("hash160", x.publicKey).toLowerCase()
      );
      const index = existingHashes.indexOf(hexHash);
      if (index >= 0) {
        return this.cache[index].signer;
      }
    }
    const signers = await this.base.getSigners();
    const newCache = await Promise.all(
      signers.map(async (signer) => ({
        signer,
        publicKey: (await signer.getCompressedPublicKey()).toLowerCase(),
      }))
    );
    this.cache = newCache;
    const existingHashes = newCache.map((x) =>
      hashHex("hash160", x.publicKey).toLowerCase()
    );
    const index = existingHashes.indexOf(hexHash);
    if (index >= 0) {
      return newCache[index].signer;
    } else {
      throw new Error("Signer not found for address " + address);
    }
  }
  getSigners(): Promise<IDogeTransactionSigner[]> {
    return this.base.getSigners();
  }
  async getCompressedPublicKeys(useCache?: boolean): Promise<string[]> {
    if (this.shouldUseCache(useCache)) {
      return this.cache.map((x) => x.publicKey);
    }
    const signers = await this.base.getSigners();
    const newCache: { signer: IDogeTransactionSigner; publicKey: string }[] = [];
    for (const signer of signers) {
      const publicKey = await signer.getCompressedPublicKey();
      newCache.push({ signer, publicKey: publicKey.toLowerCase() });
    }

    this.cache = newCache;
    return newCache.map((x) => x.publicKey);
  }
  async getSignerForPublicKey(
    compressedPublicKeyHex: string,
    useCache?: boolean
  ): Promise<IDogeTransactionSigner> {
    const target = compressedPublicKeyHex.toLowerCase();
    if (this.shouldUseCache(useCache)) {
      const existingPublicKeys = this.cache.map((x) =>
        x.publicKey.toLowerCase()
      );
      const index = existingPublicKeys.indexOf(target);
      if (index >= 0) {
        return this.cache[index].signer;
      }
    }
    const signers = await this.base.getSigners();
    const newCache = await Promise.all(
      signers.map(async (signer) => ({
        signer,
        publicKey: (await signer.getCompressedPublicKey()).toLowerCase(),
      }))
    );
    this.cache = newCache;
    const publicKeys = newCache.map((x) => x.publicKey.toLowerCase());
    const index = publicKeys.indexOf(target);
    if (index >= 0) {
      return newCache[index].signer;
    } else {
      throw new Error(
        "Signer not found for public key " + compressedPublicKeyHex
      );
    }
  }
  async getP2PKHAddresses(
    networkId: DogeNetworkId
  ): Promise<{ address: string; publicKey: string }[]> {
    const network = getDogeNetworkById(networkId);
    const publicKeys = await this.getCompressedPublicKeys();
    return publicKeys.map((pubKey) => ({
      address: encodeAddress(hashHex("hash160", pubKey, "binary"), network.pubKeyHash),
      publicKey: pubKey,
    }));
  }
}

export { FullDogeWalletProvider };
