import { Transaction } from '../transaction';
import { BytesBuilder } from '../utils/bytesBuilder';
import { BytesReader } from '../utils/bytesReader';
import { hexToU8Array, u8ArrayToHex } from '../utils/data';
import type { IAuxPow, IAuxPowJSON, IMerkleBranch, IStandardBlockHeader } from './types';
import {
  merkleBranchEncodingLength,
  readMerkleBranch,
  readStandardBlockHeader,
  writeMerkleBranch,
  writeStandardBlockHeader,
} from './utils';

class AuxPow implements IAuxPow {
  coinbaseTransaction: Transaction;
  blockHash: string;
  coinbaseBranch: IMerkleBranch;
  blockchainBranch: IMerkleBranch;
  parentBlock: IStandardBlockHeader;

  static fromBase(data: IAuxPow): AuxPow {
    return (data instanceof AuxPow) ? data : new AuxPow(
      Transaction.fromBase(data.coinbaseTransaction),
      data.blockHash,
      data.coinbaseBranch,
      data.blockchainBranch,
      data.parentBlock,
    )
  }

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
  toAuxPowJSON(): IAuxPowJSON {
    return {
      coinbaseTransaction: this.coinbaseTransaction.toTxJSON(),
      blockHash: this.blockHash,
      coinbaseBranch: this.coinbaseBranch,
      blockchainBranch: this.blockchainBranch,
      parentBlock: this.parentBlock,
    }
  }

  static fromAuxPowJSON(auxPowJSON: IAuxPowJSON): AuxPow {
    return AuxPow.fromBase({
      coinbaseTransaction: Transaction.fromTxJSON(auxPowJSON.coinbaseTransaction),
      blockHash: auxPowJSON.blockHash,
      coinbaseBranch: auxPowJSON.coinbaseBranch,
      blockchainBranch: auxPowJSON.blockchainBranch,
      parentBlock: auxPowJSON.parentBlock,
    });
  }
}


export {
  AuxPow,
}
