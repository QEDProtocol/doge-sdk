import { Transaction } from "../transaction";
import { BytesReader } from "../utils/bytesReader";
import { u8ArrayToHex } from "../utils/data";
interface IStandardBlockHeader {
  version: number;
  prevHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: number;
  nonce: number;
}
/*
function hashBlockHeader(blockHeader: IStandardBlockHeader): string {
  return 
}*/
class Block {

  version: number = 1;
  prevHash: string = "";
  merkleRoot: string = "";
  timestamp: number = 0;
  bits: number = 0;
  nonce: number = 0;
  transactions: Transaction[] = [];
/*
    if (buffer.length < 80) throw new Error('Buffer too small (< 80 bytes)');

    const bufferReader = new BufferReader(buffer);

    const block = new Block();
    block.version = bufferReader.readInt32();
    block.prevHash = bufferReader.readSlice(32);
    block.merkleRoot = bufferReader.readSlice(32);
    block.timestamp = bufferReader.readUInt32();
    block.bits = bufferReader.readUInt32();
    block.nonce = bufferReader.readUInt32();

    if (buffer.length === 80) return block;

    const readTransaction = (): any => {
      const tx = Transaction.fromBuffer(
        bufferReader.buffer.slice(bufferReader.offset),
        true,
      );
      bufferReader.offset += tx.byteLength();
      return tx;
    };

    const nTransactions = bufferReader.readVarInt();
    block.transactions = [];

    for (let i = 0; i < nTransactions; ++i) {
      const tx = readTransaction();
      block.transactions.push(tx);
    }

    const witnessCommit = block.getWitnessCommit();
    // This Block contains a witness commit
    if (witnessCommit) block.witnessCommit = witnessCommit;
    */
  static fromBuffer(buffer: Uint8Array): Block {
    if(buffer.length < 80) {
      throw new Error('Block must be at least 80 bytes long');
    }
    const block = new Block();
    const reader = new BytesReader(buffer);
    block.version = reader.readInt32();
    block.prevHash = u8ArrayToHex(reader.readBytes(32));
    block.merkleRoot = u8ArrayToHex(reader.readBytes(32));
    block.timestamp = reader.readUint32();
    block.bits = reader.readUint32();
    block.nonce = reader.readUint32();
    const nTransactions = reader.readVaruint();
    block.transactions = [];
    for(let i=0;i<nTransactions;i++){
      block.transactions.push(Transaction.fromBytesReader(reader));
    }

    return block;
  }
}


export {
  Block,
}