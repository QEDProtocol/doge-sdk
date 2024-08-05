import { hashBuffer } from '../hash';
import { Transaction } from '../transaction';
import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex, u8ArrayToHexReversed } from '../utils/data';
import { varuintEncodingLength } from '../utils/varuint';
import { AuxPow } from './auxpow';
import { BlockHeader } from './header';
import type { IMerkleBranch, IStandardBlockHeader, IStandardBlockHeaderAuxPow } from './types';
import { writeStandardBlockHeader } from './utils';

class Block implements IStandardBlockHeaderAuxPow {
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
  AuxPow
};

export type {
  IStandardBlockHeader,
  IMerkleBranch,
  IStandardBlockHeaderAuxPow,
};
