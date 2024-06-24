import { getPublicKey, signAsync } from "@noble/secp256k1";
import { DogeNetworkId, IDogeNetwork } from "../../networks/types";
import { hexToU8Array, u8ArrayToHex } from "../../utils/data";
import { getDogeNetworkById } from "../../networks";
import { decodePrivateKeyAndNetworkFromWIF, encodePrivateKeyToWIF, getP2PKHAddressFromPublicKey } from "../../address";
import { cryptoRandomBytes } from "../../utils/random";
import { IDogeTransactionSigner, IDogeWalletSerialized, ISignatureResult } from "../types";
import { Transaction } from "../../transaction";
import { derEncodeBigIntSignature } from "../../ecc";

class DogeMemoryWallet implements IDogeTransactionSigner{
  privateKey: Uint8Array;
  compressedPublicKey: Uint8Array;
  compressedPublicKeyHex: string;
  address: string;
  wif: string;
  networkId: DogeNetworkId;
  name: string;
  constructor(privateKey: Uint8Array, networkId: DogeNetworkId, name = "Wallet"){
    const publicKey = getPublicKey(privateKey, true);
    this.privateKey = privateKey;
    this.compressedPublicKey = publicKey;
    this.compressedPublicKeyHex = u8ArrayToHex(publicKey);
    this.address = getP2PKHAddressFromPublicKey(publicKey, networkId);
    this.networkId = networkId;
    this.wif = encodePrivateKeyToWIF(privateKey, networkId);
    this.name = name;
  }
  getCompressedPublicKey(): Promise<string> {
    return Promise.resolve(this.compressedPublicKeyHex);
  }
  canSignHash(): boolean {
    return true;
  }
  async signHash(hashHex: string): Promise<ISignatureResult> {
    const hash = hexToU8Array(hashHex);
    const sig = await signAsync(hash, this.privateKey);
    const result = derEncodeBigIntSignature(sig.r, sig.s);
    return {
      publicKey: this.compressedPublicKeyHex,
      signature: u8ArrayToHex(result),
    };
  }
  signTransaction(_tx: Transaction): Promise<ISignatureResult> {
    // we don't need to implement this because canSignHash is true
    throw new Error("Method not implemented.");
  }

  getId(){
    return this.networkId+"`"+this.wif;
  }

  getNetwork(): IDogeNetwork {
    return getDogeNetworkById(this.networkId);
  }

  static fromWIF(wif: string, networkId?: DogeNetworkId, name?: string){
    const { privateKey, networkId: networkIdFromWIF } = decodePrivateKeyAndNetworkFromWIF(wif, networkId);
    return new DogeMemoryWallet(privateKey, networkIdFromWIF, name);
  }
  getWalletForOtherNetwork(networkId: DogeNetworkId){
    return new DogeMemoryWallet(this.privateKey, networkId, this.name);
  }

  static generateRandom(networkId: DogeNetworkId, name?: string){
    const privateKey = cryptoRandomBytes(32);
    return new DogeMemoryWallet(privateKey, networkId, name);
  }

  serialize(): IDogeWalletSerialized {
    return {
      wif: this.wif,
      networkId: this.networkId,
      name: this.name,
    }
  }
  static deserialize(data: IDogeWalletSerialized){
    return DogeMemoryWallet.fromWIF(data.wif, data.networkId as any, data.name);
  }

  toJSON(){
    return this.serialize();
  }
}

export {
  DogeMemoryWallet,
}

export const T55 = 0;