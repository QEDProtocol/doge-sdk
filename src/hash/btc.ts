import { RIPEMD160Hasher } from "./ripemd160";
import { Sha256Hasher } from "./sha256";
import { ISimpleHasher, ValidHashEncodings } from "./types";

class Hash160Hasher implements ISimpleHasher {
  sha256: Sha256Hasher;
  constructor(){
    this.sha256 = new Sha256Hasher();
  }
  update(data: Uint8Array): this;
  update(data: string): this;
  update(data: string, encoding: ValidHashEncodings): this;
  update(data: Uint8Array | string, encoding?: ValidHashEncodings): Hash160Hasher {
    this.sha256.update(data as any, encoding as any);
    return this;
  }
  digest(): Uint8Array;
  digest(encoding: ValidHashEncodings): string;
  digest(encoding?: unknown): string | Uint8Array {
    const result = this.sha256.digest();
    return new RIPEMD160Hasher().update(result).digest(encoding as any);
  }
}


class Hash256Hasher implements ISimpleHasher {
  sha256: Sha256Hasher;
  constructor(){
    this.sha256 = new Sha256Hasher();
  }
  update(data: Uint8Array): this;
  update(data: string): this;
  update(data: string, encoding: ValidHashEncodings): this;
  update(data: Uint8Array | string, encoding?: ValidHashEncodings): Hash160Hasher {
    this.sha256.update(data as any, encoding as any);
    return this;
  }
  digest(): Uint8Array;
  digest(encoding: ValidHashEncodings): string;
  digest(encoding?: unknown): string | Uint8Array {
    const result = this.sha256.digest();
    return new Sha256Hasher().update(result).digest(encoding as any);
  }
}

export {
  Hash160Hasher,
  Hash256Hasher,
}

