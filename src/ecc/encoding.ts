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
function isValidDERSignatureEncodingInternal(sig: Uint8Array | number[]): number {
  if(sig.length < 9) return 1;
  if(sig.length > 73) return 2;
  if(sig[0] != 0x30) return 3;
  if(sig[1] != sig.length - 3) return 4;
  let lenR = sig[3];
  if(5 + lenR >= sig.length) return 5;
  let lenS = sig[5 + lenR];
  if(lenR + lenS + 7 != sig.length) return 6;
  if(sig[2] != 0x02) return 7;
  if(lenR == 0) return 8;
  if(sig[4] & 0x80) return 9;
  if(lenR > 1 && sig[4] == 0x00 && !(sig[5] & 0x80)) return 10;
  if(sig[lenR + 4] != 0x02) return 11;
  if(lenS == 0) return 12;
  if(sig[lenR + 6] & 0x80) return 13;
  if (lenS > 1 && (sig[lenR + 6] == 0x00) && !(sig[lenR + 7] & 0x80)) return 14;
  return 0;
}


function isValidDERSignatureEncoding(sig: Uint8Array | number[]): boolean {
  return isValidDERSignatureEncodingInternal(sig) === 0;
}
/*
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
function derEncodeSignatureOld(r: Uint8Array, s: Uint8Array): Uint8Array {
  const length = getSignatureLengthForRS(r, s);
  const output = new Uint8Array(length);
  output[0] = 0x30;
  output[1] = length - 2;
  let offset = 2;
  offset += writeDerEncodedU256Bytes(r, output, offset);
  offset += writeDerEncodedU256Bytes(s, output, offset);
  return output;
}*/


/*
static int secp256k1_ecdsa_sig_serialize(unsigned char *sig, size_t *size, const secp256k1_scalar* ar, const secp256k1_scalar* as) {
  unsigned char r[33] = {0}, s[33] = {0};
  unsigned char *rp = r, *sp = s;
  size_t lenR = 33, lenS = 33;
  secp256k1_scalar_get_b32(&r[1], ar);
  secp256k1_scalar_get_b32(&s[1], as);
  while (lenR > 1 && rp[0] == 0 && rp[1] < 0x80) { lenR--; rp++; }
  while (lenS > 1 && sp[0] == 0 && sp[1] < 0x80) { lenS--; sp++; }
  if (*size < 6+lenS+lenR) {
      *size = 6 + lenS + lenR;
      return 0;
  }
  *size = 6 + lenS + lenR;
  sig[0] = 0x30;
  sig[1] = 4 + lenS + lenR;
  sig[2] = 0x02;
  sig[3] = lenR;
  memcpy(sig+4, rp, lenR);
  sig[4+lenR] = 0x02;
  sig[5+lenR] = lenS;
  memcpy(sig+lenR+6, sp, lenS);
  return 1;
}*/
function derEncodeSignature(ar: Uint8Array, as: Uint8Array): Uint8Array {
  const r = new Uint8Array(33);
  const s = new Uint8Array(33);
  let lenR = 33;
  let lenS = 33;
  r.set(ar, 1);
  s.set(as, 1);
  let rp = 0;
  let sp = 0;
  while (lenR > 1 && r[rp] === 0 && r[rp+1] < 0x80) { lenR--; rp++; }
  while (lenS > 1 && s[sp] === 0 && s[sp+1] < 0x80) { lenS--; sp++; }
  const length = 6 + lenS + lenR;
  const output = new Uint8Array(length);
  output[0] = 0x30;
  output[1] = 4 + lenS + lenR;
  output[2] = 0x02;
  output[3] = lenR;
  output.set(r.subarray(rp, rp+lenR), 4);
  output[4+lenR] = 0x02;
  output[5+lenR] = lenS;
  output.set(s.subarray(sp, sp+lenS), lenR+6);
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
  isValidDERSignatureEncoding,
  isValidDERSignatureEncodingInternal,
}
