import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex } from '../utils/data';
import { AuxPow } from './auxpow';
import { IStandardBlockHeaderAuxPow } from './types';
import { readStandardBlockHeader, writeStandardBlockHeader } from './utils';

class BlockHeader implements IStandardBlockHeaderAuxPow {
  auxData?: AuxPow | undefined;
  version: number;
  prevHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: number;
  nonce: number;

  constructor({
    version,
    prevHash,
    merkleRoot,
    timestamp,
    bits,
    nonce,
    auxData,
  }: IStandardBlockHeaderAuxPow) {
    this.version = version;
    this.prevHash = prevHash;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
    this.auxData = auxData;
  }

  byteLength(): number {
    return this.auxData ? (80 + this.auxData.byteLength()) : 80;
  }

  writeToBytesBuilder(builder: BytesBuilder): BytesBuilder {
    writeStandardBlockHeader(builder, this);
    if(this.auxData) {
      this.auxData.writeToBytesBuilder(builder);
    }
    return builder;
  }

  toBuffer(): Uint8Array {
    return this.writeToBytesBuilder(
      new BytesBuilder(this.byteLength())
    ).toBuffer();
  }

  toHex(): string {
    return u8ArrayToHex(this.toBuffer());
  }

  static fromBytesReader(reader: BytesReader): BlockHeader {
    const block = new BlockHeader(
      readStandardBlockHeader(reader),
    );
    if ((block.version & 0x100) !== 0) {
      block.auxData = AuxPow.fromBytesReader(reader);
    }
    return block;
  }

  static fromBuffer(buffer: Uint8Array): BlockHeader {
    if (buffer.length < 80) {
      throw new Error('Block must be at least 80 bytes long');
    }
    const reader = new BytesReader(buffer);
    return this.fromBytesReader(reader);
  }

  static fromHex(hex: string): BlockHeader {
    return this.fromBuffer(hexToU8Array(hex));
  }

}


export {
  BlockHeader,
}
