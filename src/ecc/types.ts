interface IHashSigner {
  getCompressedPublicKeyHex(): Promise<string>;
  signMessageHash(messageHash: Uint8Array): Promise<Uint8Array>;
}

interface ISimpleSecp256K1Provider {
  getCompressedPublicKeysHex(): Promise<string[]>;
  getSignerForPublicKey(publicKey: Uint8Array): Promise<IHashSigner>;
}

export type {
  IHashSigner,
  ISimpleSecp256K1Provider,
}