import { getPublicKey, signAsync } from '@noble/secp256k1';
import { u8ArrayToHex } from '../utils/data';
import { IHashSigner, ISimpleSecp256K1Provider } from './types';
import { bigIntU256ToBytesBE, derEncodeSignature } from './encoding';
import { cryptoRandomBytes } from '../utils/random';

class MemorySecp256K1Provider implements ISimpleSecp256K1Provider {
  keys: Record<string, Uint8Array> = {};
  addPrivateKey(privateKey: Uint8Array) {
    const publicKey = getPublicKey(privateKey, true);
    this.keys[u8ArrayToHex(publicKey)] = privateKey;
    return publicKey;
  }
  getPrivateKey(publicKey: Uint8Array | string) {
    return this.keys[
      typeof publicKey === 'string' ? publicKey : u8ArrayToHex(publicKey)
    ];
  }
  addRandomPrivateKey() {
    return this.addPrivateKey(cryptoRandomBytes(32));
  }
  getCompressedPublicKeysHex(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.keys));
  }
  getSignerForPublicKey(publicKey: Uint8Array): Promise<IHashSigner> {
    const privateKey = this.keys[u8ArrayToHex(publicKey)];
    if (!privateKey) {
      throw new Error('Private key not found for public key');
    }
    return Promise.resolve({
      getCompressedPublicKeyHex: async () => u8ArrayToHex(publicKey),
      signMessageHash: async messageHash => {
        const { r, s } = await signAsync(messageHash, privateKey);
        return derEncodeSignature(
          bigIntU256ToBytesBE(r),
          bigIntU256ToBytesBE(s)
        );
      },
    });
  }
}

export {
  MemorySecp256K1Provider,
}