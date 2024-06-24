import { Hash160Hasher, Hash256Hasher } from "./btc";
import { RIPEMD160Hasher } from "./ripemd160";
import { Sha256Hasher } from "./sha256";
import { ISimpleHasher, ValidHashAlgorithms, ValidHashEncodings } from "./types";

function createHash(algorithm: ValidHashAlgorithms): ISimpleHasher {
  if(algorithm === "sha256"){
    return new Sha256Hasher();
  }else if(algorithm === "ripemd160"){
    return new RIPEMD160Hasher();
  }else if(algorithm === "hash256"){
    return new Hash256Hasher();
  }else if(algorithm === "hash160"){
    return new Hash160Hasher();
  }else{
    throw new Error("Invalid algorithm '" + algorithm + "'");
  }
}

function hashBuffer(algorithm: ValidHashAlgorithms, data: Uint8Array, outputEncoding: "binary" | undefined): Uint8Array;
function hashBuffer(algorithm: ValidHashAlgorithms, data: Uint8Array): Uint8Array;
function hashBuffer(algorithm: ValidHashAlgorithms, data: Uint8Array, outputEncoding: "hex" | "utf8" | "utf-8"): string;
function hashBuffer(algorithm: ValidHashAlgorithms, data: Uint8Array, outputEncoding: ValidHashEncodings = "binary"): Uint8Array | string {
  return createHash(algorithm).update(data).digest(outputEncoding);
}
function hashHex(algorithm: ValidHashAlgorithms, data: string | Uint8Array): string;
function hashHex(algorithm: ValidHashAlgorithms, data: string | Uint8Array, outputEncoding: "binary"): Uint8Array;
function hashHex(algorithm: ValidHashAlgorithms, data: string | Uint8Array, outputEncoding: "hex" | "utf8" | "utf-8"): string;
function hashHex(algorithm: ValidHashAlgorithms, data: string | Uint8Array, outputEncoding: ValidHashEncodings = "hex"): Uint8Array | string {
  const hasher = createHash(algorithm);
  if(typeof data === "string"){
    return hasher.update(data, "hex").digest(outputEncoding);
  }else{
    return hasher.update(data).digest(outputEncoding);
  }
}

export {
  createHash,
  hashBuffer,
  hashHex,
}