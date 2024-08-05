import { Transaction } from '../transaction';
import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex } from '../utils/data';
import { IMerkleBranch, IStandardBlockHeader } from './types';
import {
  merkleBranchEncodingLength,
  readMerkleBranch,
  readStandardBlockHeader,
  writeMerkleBranch,
  writeStandardBlockHeader,
} from './utils';

class AuxPow {
  coinbaseTransaction: Transaction;
  blockHash: string;
  coinbaseBranch: IMerkleBranch;
  blockchainBranch: IMerkleBranch;
  parentBlock: IStandardBlockHeader;

  constructor(
    coinbaseTransaction: Transaction,
    blockHash: string,
    coinbaseBranch: IMerkleBranch,
    blockchainBranch: IMerkleBranch,
    parentBlock: IStandardBlockHeader
  ) {
    this.coinbaseTransaction = coinbaseTransaction;
    this.blockHash = blockHash;
    this.coinbaseBranch = coinbaseBranch;
    this.blockchainBranch = blockchainBranch;
    this.parentBlock = parentBlock;
  }

  byteLength(): number {
    return (
      this.coinbaseTransaction.byteLength(true) +
      32 +
      merkleBranchEncodingLength(this.coinbaseBranch) +
      merkleBranchEncodingLength(this.blockchainBranch) +
      80
    );
  }

  writeToBytesBuilder(builder: BytesBuilder): BytesBuilder {
    this.coinbaseTransaction.writeToBytesBuilder(builder, true, null);
    builder.writeBytes(hexToU8Array(this.blockHash));
    writeMerkleBranch(builder, this.coinbaseBranch);
    writeMerkleBranch(builder, this.blockchainBranch);
    writeStandardBlockHeader(builder, this.parentBlock);
    return builder;
  }

  toBuffer(): Uint8Array {
    return this.writeToBytesBuilder(
      new BytesBuilder(this.byteLength())
    ).toBuffer();
  }

  toHex() {
    return u8ArrayToHex(this.toBuffer());
  }

  static fromBuffer(buffer: Uint8Array): AuxPow {
    return AuxPow.fromBytesReader(new BytesReader(buffer));
  }

  static fromHex(hex: string): AuxPow {
    return AuxPow.fromBuffer(hexToU8Array(hex));
  }

  static fromBytesReader(reader: BytesReader): AuxPow {
    const coinbaseTransaction = Transaction.fromBytesReader(reader);
    const blockHash = u8ArrayToHex(reader.readBytes(32));
    const coinbaseBranch = readMerkleBranch(reader);
    const blockchainBranch = readMerkleBranch(reader);
    const parentBlock = readStandardBlockHeader(reader);

    return new AuxPow(
      coinbaseTransaction,
      blockHash,
      coinbaseBranch,
      blockchainBranch,
      parentBlock
    );
  }
}


export {
  AuxPow,
}
