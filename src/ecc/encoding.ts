import { verify } from "@qed-noble/secp256k1";
import { hexToU8Array, u8ArrayToHex } from "../utils/data";

function normalizeSignatureFromDer(signatureHexDer: string) {
  const bytes = hexToU8Array(signatureHexDer);
  if(bytes[0]!==0x30){
    throw new Error("Invalid Signature");
  }
  const rLen = bytes[3];
  let r = u8ArrayToHex(bytes.slice(4, 4+rLen));
  const sLen = bytes[4+rLen+1];
  let s = u8ArrayToHex(bytes.slice(4+rLen+2));
  if(r.length>64){
    r = r.substring(2);
  }
  if(s.length>64){
    s = s.substring(2);
  }
  return r+s;
}


function verifyNormailzedSignature(signatureHex: string, messageHashHex: string, publicKeyHex: string): boolean {
  const r= BigInt("0x"+signatureHex.substring(0,64));
  const s= BigInt("0x"+signatureHex.substring(64));
  return verify({
    r,s
  }, messageHashHex, publicKeyHex);
}
function verifyNormalizeSecp256K1Signature(signatureHex: string, messageHashHex: string, publicKeyHex: string): string {
  if(signatureHex.length===64){
    if(verifyNormailzedSignature(signatureHex, messageHashHex, publicKeyHex)){
      return signatureHex;
    }else{
      throw new Error("Invalid Signature");
    }
  }else if(signatureHex.length>64 && signatureHex.substring(0,2)==="30"){
    const normalized = normalizeSignatureFromDer(signatureHex);
    if(verifyNormailzedSignature(normalized, messageHashHex, publicKeyHex)){
      return normalized;
    }else{
      throw new Error("Invalid Signature");
    }
  }else{
    throw new Error("Invalid Signature");
  }
}

function bigIntU256ToBytesBE(u256: bigint): Uint8Array {
  return hexToU8Array(u256.toString(16).padStart(64, '0'));
}

function writeDerEncodedU256Bytes(xBytesBE: Uint8Array, dest: Uint8Array, destOffset: number): number {
  const hasExtraPadByte = xBytesBE[0] >= 0x80;
  const offset = hasExtraPadByte ? 1 : 0;
  const length = xBytesBE.length + 2 + offset;
  dest[destOffset] = 0x02;
  dest[destOffset+1] = xBytesBE.length + offset;
  if(hasExtraPadByte){
    dest[destOffset+2] = 0x00;
    dest.set(xBytesBE, destOffset+3);
  }else{
    dest.set(xBytesBE, destOffset+2);
  }
  return length;
}
function getSignatureLengthForRS(r: Uint8Array, s: Uint8Array): number {
  return 6 + r.length + s.length + (r[0] >= 0x80 ? 1 : 0) + (s[0] >= 0x80 ? 1 : 0);
}
function derEncodeSignature(r: Uint8Array, s: Uint8Array): Uint8Array {
  const length = getSignatureLengthForRS(r, s);
  const output = new Uint8Array(length);
  output[0] = 0x30;
  output[1] = length - 2;
  let offset = 2;
  offset += writeDerEncodedU256Bytes(r, output, offset);
  offset += writeDerEncodedU256Bytes(s, output, offset);
  return output;
}
function derEncodeBigIntSignature(r: bigint, s: bigint): Uint8Array {
  return derEncodeSignature(bigIntU256ToBytesBE(r), bigIntU256ToBytesBE(s));
}

function compressPublicKey(publicKey: Uint8Array): Uint8Array {
  if (publicKey.length !== 65) {
    throw new Error('Invalid public key length');
  }
  if(publicKey[0] !== 0x04){
    throw new Error('Invalid public key prefix');
  }
  const compressed = new Uint8Array(33);
  compressed[0] = (publicKey[64] & 1) !== 0 ? 0x03 : 0x02;
  compressed.set(publicKey.subarray(1, 1 + 32), 1);
  return compressed;
}


export {
  derEncodeSignature,
  bigIntU256ToBytesBE,
  compressPublicKey,
  derEncodeBigIntSignature,
  normalizeSignatureFromDer,
  verifyNormalizeSecp256K1Signature,
  verifyNormailzedSignature,
}
