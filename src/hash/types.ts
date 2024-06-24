type ValidHashEncodings = "hex" | "utf-8" | "utf8" | "binary";
type ValidHashAlgorithms = "sha256" | "ripemd160" | "hash256" | "hash160";
interface ISimpleHasher {
  update(data: Uint8Array): this;
  update(data: string): this;
  update(data: string, encoding: ValidHashEncodings): this;
  digest(): Uint8Array;
  digest(encoding: ValidHashEncodings): string;
}

export type {
  ISimpleHasher,
  ValidHashEncodings,
  ValidHashAlgorithms,
}