import { hashBuffer } from '../hash';
import { Transaction } from '../transaction';
import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex, u8ArrayToHexReversed } from '../utils/data';
import { varuintEncodingLength } from '../utils/varuint';
import { AuxPow } from './auxpow';
import { VERSION_AUXPOW } from './constants';
import { BlockHeader } from './header';
import { getNextWorkRequired, getNextWorkRequiredModern } from './pow';
import type { IAuxPow, IAuxPowJSON, IMerkleBranch, IStandardBlockAuxPow, IStandardBlockAuxPowJSON, IStandardBlockHeader, IStandardBlockHeaderAuxPow, IStandardBlockHeaderAuxPowJSON } from './types';
import { getTargetForBits, writeStandardBlockHeader } from './utils';

class Block implements IStandardBlockAuxPow {
  version: number = 1;
  prevHash: string = '';
  merkleRoot: string = '';
  timestamp: number = 0;
  bits: number = 0;
  nonce: number = 0;
  auxData?: AuxPow;

  transactions: Transaction[] = [];


  getBlockHeader(): BlockHeader {
    return new BlockHeader(this);
  }

  getBlockHash(): string {
    const builder = new BytesBuilder(80);
    writeStandardBlockHeader(builder, this);
    return u8ArrayToHexReversed(hashBuffer("hash256", builder.toBuffer()));
  }

  byteLength(): number {
    const headerLength = this.auxData ? (80 + this.auxData.byteLength()) : 80;
    const transactionsLength = this.transactions.reduce((acc, tx) => acc + tx.byteLength(false), 0) + varuintEncodingLength(this.transactions.length);
    return headerLength + transactionsLength;
  }

  writeToBytesBuilder(builder: BytesBuilder): BytesBuilder {
    this.getBlockHeader().writeToBytesBuilder(builder);

    builder.writeVaruint(this.transactions.length);

    // dogecoin transaction do not have witness data, so allowWitness is false
    this.transactions.forEach((tx) => tx.writeToBytesBuilder(builder, false, null));

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

  toBlockJSON(): IStandardBlockAuxPowJSON {
    const base: IStandardBlockAuxPowJSON = {
      version: this.version,
      prevHash: this.prevHash,
      merkleRoot: this.merkleRoot,
      timestamp: this.timestamp,
      bits: this.bits,
      nonce: this.nonce,
      transactions: this.transactions.map(x => x.toTxJSON()),
    };
    if (this.auxData) {
      base.auxData = this.auxData.toAuxPowJSON();
    }
    return base;
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

  static fromBlockJSON({
    version,
    prevHash,
    merkleRoot,
    timestamp,
    bits,
    nonce,
    auxData,
    transactions,
  }: IStandardBlockAuxPowJSON): Block {
    const block = new Block();
    block.version = version;
    block.prevHash = prevHash;
    block.merkleRoot = merkleRoot;
    block.timestamp = timestamp;
    block.bits = bits;
    block.nonce = nonce;
    block.auxData = auxData ? AuxPow.fromAuxPowJSON(auxData) : undefined;
    block.transactions = transactions.map(tx => Transaction.fromTxJSON(tx));
    return block;
  }

  static fromBase({
    version,
    prevHash,
    merkleRoot,
    timestamp,
    bits,
    nonce,
    auxData,
    transactions,
  }: IStandardBlockAuxPow): Block {
    const block = new Block();
    block.version = version;
    block.prevHash = prevHash;
    block.merkleRoot = merkleRoot;
    block.timestamp = timestamp;
    block.bits = bits;
    block.nonce = nonce;
    block.auxData = auxData ? AuxPow.fromBase(auxData) : undefined;
    block.transactions = transactions.map(tx => tx instanceof Transaction ? tx : Transaction.fromBase(tx));
    return block;
  }

  static fromBytesReader(reader: BytesReader): Block {
    const header = BlockHeader.fromBytesReader(reader);

    const nTransactions = reader.readVaruint();

    const transactions = [];
    for (let i = 0; i < nTransactions; i++) {
      transactions.push(Transaction.fromBytesReader(reader));
    }

    const block = new Block();

    block.version = header.version;
    block.prevHash = header.prevHash;
    block.merkleRoot = header.merkleRoot;
    block.timestamp = header.timestamp;
    block.bits = header.bits;
    block.nonce = header.nonce;
    block.auxData = header.auxData;

    block.transactions = transactions;

    return block;
  }

  static fromBuffer(buffer: Uint8Array): Block {
    if (buffer.length < 80) {
      throw new Error('Block must be at least 80 bytes long');
    }
    return Block.fromBytesReader(new BytesReader(buffer));
  }

  static fromHex(hex: string): Block {
    return Block.fromBuffer(hexToU8Array(hex));
  }

}

export {
  Block,
  BlockHeader,
  AuxPow,
  getNextWorkRequiredModern,
  getNextWorkRequired,
};

export type {
  IAuxPow,
  IAuxPowJSON,
  IStandardBlockHeader,
  IMerkleBranch,
  IStandardBlockHeaderAuxPow,
  IStandardBlockHeaderAuxPowJSON,
  IStandardBlockAuxPow,
  IStandardBlockAuxPowJSON,
};
