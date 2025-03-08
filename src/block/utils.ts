
import { BytesBuilder } from "../utils/bytesBuilder";
import { BytesReader } from "../utils/bytesReader";
import { hexToU8Array, reverseHexString, u8ArrayToHex } from "../utils/data";
import { varuintEncodingLength } from "../utils/varuint";
import { IMerkleBranch, IStandardBlockHeader } from "./types";

function readMerkleBranch(reader: BytesReader): IMerkleBranch {
  const count = reader.readVaruint();
  const hashes: string[] = [];
  for (let i = 0; i < count; i++) {
    hashes.push(u8ArrayToHex(reader.readBytes(32)));
  }
  const sideMask = reader.readUint32();
  return {
    hashes,
    sideMask,
  };
}

function merkleBranchEncodingLength(merkleBranch: IMerkleBranch): number {
  return varuintEncodingLength(merkleBranch.hashes.length) + 32 * merkleBranch.hashes.length + 4;
}

function writeMerkleBranch(builder: BytesBuilder, merkleBranch: IMerkleBranch): BytesBuilder {
  builder.writeVaruint(merkleBranch.hashes.length);
  for (const hash of merkleBranch.hashes) {
    builder.writeBytes(hexToU8Array(hash));
  }
  builder.writeUint32(merkleBranch.sideMask);
  return builder;
}

function readStandardBlockHeader(reader: BytesReader): IStandardBlockHeader {
  const version = reader.readInt32();
  const prevHash = u8ArrayToHex(reader.readBytes(32));
  const merkleRoot = u8ArrayToHex(reader.readBytes(32));
  const timestamp = reader.readUint32();
  const bits = reader.readUint32();
  const nonce = reader.readUint32();

  return {
    version,
    prevHash,
    merkleRoot,
    timestamp,
    bits,
    nonce,
  };
}

function writeStandardBlockHeader(builder: BytesBuilder, header: IStandardBlockHeader): BytesBuilder {
  builder.writeInt32(header.version);
  builder.writeBytes(hexToU8Array(header.prevHash));
  builder.writeBytes(hexToU8Array(header.merkleRoot));
  builder.writeUint32(header.timestamp);
  builder.writeUint32(header.bits);
  builder.writeUint32(header.nonce);

  return builder;
}

/*
function getTargetForBits(bits: number): bigint {
  const exponent = (bits >>> 24) & 0xff;
  const significand = bits & 0xffffff;
  const shiftAmount = 8 * (exponent - 3);

  if (shiftAmount <= 0) {
    return BigInt(significand >>> (-1 * shiftAmount));
  } else {
    return BigInt(significand) << BigInt(shiftAmount);
  }
}*/
function getTargetForBits(nCompact: number): bigint {
  const nSize = (nCompact >>> 24) & 0xff;
  const nWord = nCompact & 0x007fffff;

  if (nSize <= 3) {
    return BigInt(nWord >>> (8 * (3 - nSize)));
  } else {
    return BigInt(nWord) << BigInt(8 * (nSize - 3));
  }
}
function getTargetForBitsOverflow(nCompact: number): bigint {
  const nSize = (nCompact >>> 24) & 0xff;
  let nWord = nCompact & 0x007fffff;
  if (nSize <= 3) {
    nWord >>>= 8 * (3 - nSize);
  }

  const pfNegative = nWord !== 0 && (nCompact & 0x00800000) !== 0;
  const pfOverflow = nWord !== 0 && ((nSize > 34) ||
    (nWord > 0xff && nSize > 33) ||
    (nWord > 0xffff && nSize > 32));

  if (pfNegative || pfOverflow) {
    return BigInt(0);
  }

  if (nSize <= 3) {
    return BigInt(nWord);
  } else {
    return BigInt(nWord) << BigInt(8 * (nSize - 3));
  }
}
function getBitsForTarget(target: bigint): number {
  const nBits = target === BigInt(0) ? 0 : target.toString(2).length;

    let nSize = Math.floor((nBits + 7) / 8);
    let nCompact = 0;
    
    if (nSize <= 3) {
      nCompact = (parseInt(target+"",10)&0xffffffff) << (8 * (3 - nSize));
    } else {
      nCompact = parseInt(((target>>BigInt(8 * (nSize - 3)))&BigInt("0xffffffff"))+"",10);
    }
    // The 0x00800000 bit denotes the sign.
    // Thus, if it is already set, divide the mantissa by 256 and increase the exponent.
    if (nCompact & 0x00800000) {
        nCompact >>= 8;
        nSize++;
    }
    /*
    assert((nCompact & ~0x007fffff) == 0);
    assert(nSize < 256);*/
    nCompact |= nSize << 24;
    //nCompact |= (fNegative && (nCompact & 0x007fffff) ? 0x00800000 : 0);
    return nCompact;
}
function checkProofOfWork(hash: string, nBits: number, powLimit: bigint | string): boolean {

  const hashValue = BigInt("0x" + reverseHexString(hash));
  const target = getTargetForBitsOverflow(nBits);
  const realPowLimit = typeof powLimit === 'bigint' ? powLimit : BigInt(powLimit.startsWith("0x") ? powLimit : ("0x" + powLimit));

  if (target === BigInt(0) || target > realPowLimit || hashValue > target) {
    return false;
  } else {
    return true;
  }

}
export {
  readMerkleBranch,
  merkleBranchEncodingLength,
  writeMerkleBranch,
  readStandardBlockHeader,
  writeStandardBlockHeader,
  getTargetForBits,
  getTargetForBitsOverflow,
  checkProofOfWork,
  getBitsForTarget,
}
