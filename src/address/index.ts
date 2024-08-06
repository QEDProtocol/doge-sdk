import { compressPublicKey } from '../ecc';
import { hashBuffer } from '../hash';
import { getDogeNetworkById } from '../networks';
import { DogeNetworkId } from '../networks/types';
import {
  decodeBase58WithChecksum,
  encodeBase58WithChecksum,
} from '../utils/base58';
import { getNetworkIdFromAddressVersion, getNetworkIdFromPrivateKeyVersion, isAddressVersionP2PKH, isAddressVersionP2SH } from './network';

function encodeAddress(hash: Uint8Array, version: number): string {
  const payload = new Uint8Array(1 + hash.length);
  payload[0] = version;
  payload.set(hash, 1);
  return encodeBase58WithChecksum(payload);
}
function decodeAddress(
  address: string
): { version: number; hash: Uint8Array } {
  const payload = decodeBase58WithChecksum(address);
  return {
    version: payload[0],
    hash: payload.subarray(1),
  };
}

function encodePrivateKeyToWIF(privateKey: Uint8Array, networkId: DogeNetworkId): string {
  const network = getDogeNetworkById(networkId);
  const payload = new Uint8Array(1 + 32 + 1);
  payload[0] = network.wif;
  payload.set(privateKey, 1);
  payload[33] = 0x01;
  return encodeBase58WithChecksum(payload);
}
function decodePrivateKeyFromWIF(wif: string): Uint8Array {
  const payload = decodeBase58WithChecksum(wif);
  return payload.subarray(1, 33);
}
function decodeAddressFull(
  address: string,
  knownNetworkId?: DogeNetworkId
): { hash: Uint8Array; networkId: DogeNetworkId, version: number} {
  const {version, hash} = decodeAddress(address);
  const networkId = typeof knownNetworkId === 'string' ? knownNetworkId : getNetworkIdFromAddressVersion(version);
  return { hash, networkId, version };
}

function decodePrivateKeyAndNetworkFromWIF(
  wif: string,
  knownNetworkId?: DogeNetworkId
): { privateKey: Uint8Array; networkId: DogeNetworkId } {
  const payload = decodeBase58WithChecksum(wif);
  const networkId = typeof knownNetworkId === 'string' ? knownNetworkId : getNetworkIdFromPrivateKeyVersion(payload[0]);
  const privateKey = payload.subarray(1, 33);
  return { privateKey, networkId };
}

function encodeP2PKHAddress(networkId: DogeNetworkId, publicKeyHash: Uint8Array): string {
  const network = getDogeNetworkById(networkId);
  return encodeAddress(publicKeyHash, network.pubKeyHash);
}
function encodeP2SHAddress(networkId: DogeNetworkId, scriptHash: Uint8Array): string {
  const network = getDogeNetworkById(networkId);
  return encodeAddress(scriptHash, network.scriptHash);
}

function isP2PKHAddress(address: string): boolean {
  const { version } = decodeAddress(address);
  return isAddressVersionP2PKH(version);
}

function isP2SHAddress(address: string): boolean {
  const { version } = decodeAddress(address);
  return isAddressVersionP2SH(version);
}
function getP2PKHAddressFromPublicKey(publicKey: Uint8Array, networkId: DogeNetworkId): string {
  if(publicKey.length === 33){
    return encodeP2PKHAddress(networkId, hashBuffer("hash160", publicKey));
  }else if(publicKey.length === 65){
    return encodeP2PKHAddress(networkId, hashBuffer("hash160", compressPublicKey(publicKey)));
  }else{
    throw new Error('Invalid public key length '+publicKey.length+' bytes, must be 33 or 65 bytes');
  }
}
function isP2PKHOutputScript(script: Uint8Array): boolean {
  return script.length === 25 && script[0] === 0x76 && script[1] === 0xa9 && script[2] === 0x14 && script[23] === 0x88 && script[24] === 0xac;
}
function getPublicKeyHashFromP2PKHOutputScript(script: Uint8Array): Uint8Array {
  if(!isP2PKHOutputScript(script)){
    throw new Error('Invalid P2PKH script');
  }
  return script.subarray(3, 23);
}
function getAddressFromP2PKHOutputScript(script: Uint8Array, networkId: DogeNetworkId): string {
  return encodeP2PKHAddress(networkId, getPublicKeyHashFromP2PKHOutputScript(script));
}

function getP2PKHOutputScript(publicKeyHash: Uint8Array): Uint8Array {
  const script = new Uint8Array(25);
  script[0] = 0x76;
  script[1] = 0xa9;
  script[2] = 0x14;
  script.set(publicKeyHash, 3);
  script[23] = 0x88;
  script[24] = 0xac;
  return script;
}
function getP2SHOutputScript(scriptHash: Uint8Array): Uint8Array {
  const script = new Uint8Array(23);
  script[0] = 0xa9;
  script[1] = 0x14;
  script.set(scriptHash, 2);
  script[22] = 0x87;
  return script;
}

function addressToOutputScript(address: string) {
  const {version, hash} = decodeAddress(address);
  if(isAddressVersionP2PKH(version)){
    return getP2PKHOutputScript(hash);
  }else if(isAddressVersionP2SH(version)){
    return getP2SHOutputScript(hash);
  }else{
    throw new Error('Unknown address type');
  }
}


export {
  encodeAddress,
  decodeAddress,
  encodeP2PKHAddress,
  encodeP2SHAddress,
  isP2PKHAddress,
  isP2SHAddress,
  isP2PKHOutputScript,
  addressToOutputScript,
  decodePrivateKeyAndNetworkFromWIF,
  decodePrivateKeyFromWIF,
  encodePrivateKeyToWIF,
  getP2PKHAddressFromPublicKey,
  decodeAddressFull,
  getP2PKHOutputScript,
  getP2SHOutputScript,
  getPublicKeyHashFromP2PKHOutputScript,
  getAddressFromP2PKHOutputScript,
}
