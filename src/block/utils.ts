
import { BytesBuilder } from "../utils/bytesBuilder";
import { BytesReader } from "../utils/bytesReader";
import { hexToU8Array, u8ArrayToHex } from "../utils/data";
import { varuintEncodingLength } from "../utils/varuint";
import { IMerkleBranch, IStandardBlockHeader } from "./types";

function readMerkleBranch(reader: BytesReader): IMerkleBranch {
  const count = reader.readVaruint();
  const hashes: string[] = [];
  for(let i = 0; i < count; i++){
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
  for(const hash of merkleBranch.hashes){
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



export {
  readMerkleBranch,
  merkleBranchEncodingLength,
  writeMerkleBranch,
  readStandardBlockHeader,
  writeStandardBlockHeader,
}
