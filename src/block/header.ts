import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex } from '../utils/data';
import { AuxPow } from './auxpow';
import { VERSION_AUXPOW } from './constants';
import { IStandardBlockHeaderAuxPow, IStandardBlockHeaderAuxPowJSON } from './types';
import { getTargetForBits, readStandardBlockHeader, writeStandardBlockHeader } from './utils';

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
    this.auxData = auxData ? AuxPow.fromBase(auxData) : undefined;
  }

  getTarget(): bigint {
    return getTargetForBits(this.bits);
  }
  
  isNull(): boolean {
    return this.bits === 0;
  }
  getBaseVersion(): number {
    return this.version % VERSION_AUXPOW;
  }
  getChainId(): number {
    return this.version >>> 16;
  }
  isAuxPow(): boolean {
    return (this.version & VERSION_AUXPOW) !== 0;
  }
  isLegacy(): boolean {
    return this.version === 1
      // Dogecoin: We have a random v2 block with no AuxPoW, treat as legacy
      || (this.version === 2 && this.getChainId() == 0);
  }

  byteLength(): number {
    return this.auxData ? (80 + this.auxData.byteLength()) : 80;
  }

  writeToBytesBuilder(builder: BytesBuilder): BytesBuilder {
    writeStandardBlockHeader(builder, this);
    if (this.auxData) {
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

  static fromBase(header: IStandardBlockHeaderAuxPow): BlockHeader {
    return new BlockHeader(header);
  }

  static fromBlockHeaderJSON(header: IStandardBlockHeaderAuxPowJSON): BlockHeader {
    return new BlockHeader({
      version: header.version,
      prevHash: header.prevHash,
      merkleRoot: header.merkleRoot,
      timestamp: header.timestamp,
      bits: header.bits,
      nonce: header.nonce,
      auxData: header.auxData ? AuxPow.fromAuxPowJSON(header.auxData) : undefined,
    });
  }

  toBlockHeaderJSON(): IStandardBlockHeaderAuxPowJSON {
    const base: IStandardBlockHeaderAuxPowJSON = {
      version: this.version,
      prevHash: this.prevHash,
      merkleRoot: this.merkleRoot,
      timestamp: this.timestamp,
      bits: this.bits,
      nonce: this.nonce,
    };
    if (this.auxData) {
      base.auxData = this.auxData.toAuxPowJSON();
    }

    return base;
  }

}


export {
  BlockHeader,
}
