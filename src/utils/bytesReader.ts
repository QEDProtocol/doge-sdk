import { decodeVaruint, varuintEncodingLength } from "./varuint";

class BytesReader {
  buffer: Uint8Array;
  view: DataView;
  offset: number = 0;
  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer);
  }
  reserve(size: number): number {
    if (this.offset + size > this.buffer.length) {
      throw new Error('Out of bounds');
    }
    return size;
  }
  readByte(): number {
    this.reserve(1);
    return this.buffer[this.offset++];
  }
  readUint16(littleEndian = true): number {
    this.reserve(2);
    const value = this.view.getUint16(this.offset, littleEndian);
    this.offset += 2;
    return value;
  }
  readUint32(littleEndian = true): number {
    this.reserve(4);
    const value = this.view.getUint32(this.offset, littleEndian);
    this.offset += 4;
    return value;
  }
  readUint64(littleEndian = true): bigint {
    this.reserve(8);
    const value = this.view.getBigUint64(this.offset, littleEndian);
    this.offset += 8;
    return value;
  }
  readInt8(): number {
    this.reserve(1);
    return this.view.getInt8(this.offset++);
  }
  readInt16(littleEndian = true): number {
    this.reserve(2);
    const value = this.view.getInt16(this.offset, littleEndian);
    this.offset += 2;
    return value;
  }
  readInt32(littleEndian = true): number {
    this.reserve(4);
    const value = this.view.getInt32(this.offset, littleEndian);
    this.offset += 4;
    return value;
  }
  readInt64(littleEndian = true): bigint {
    this.reserve(8);
    const value = this.view.getBigInt64(this.offset, littleEndian);
    this.offset += 8;
    return value;
  }
  readBytes(size: number): Uint8Array {
    this.reserve(size);
    const bytes = this.buffer.slice(this.offset, this.offset + size);
    this.offset += size;
    return bytes;
  }
  readVaruint(): number {
    const decoded = decodeVaruint(this.buffer, this.offset);
    this.offset += varuintEncodingLength(decoded);
    return decoded;
  }
  readVarSlice(): Uint8Array {
    const size = this.readVaruint();
    return this.readBytes(size);
  }
  peekByte(): number {
    return this.buffer[this.offset];
  }
  peekUint16(littleEndian = true): number {
    return this.view.getUint16(this.offset, littleEndian);
  }
  peekUint32(littleEndian = true): number {
    return this.view.getUint32(this.offset, littleEndian);
  }
  peekUint64(littleEndian = true): bigint {
    return this.view.getBigUint64(this.offset, littleEndian);
  }
  peekBytes(size: number): Uint8Array {
    return this.buffer.slice(this.offset, this.offset + size);
  }
  peekVaruint(): number {
    return decodeVaruint(this.buffer, this.offset);
  }
  peekVarSlice(): Uint8Array {
    const size = this.peekVaruint();
    return this.buffer.slice(this.offset + varuintEncodingLength(size), this.offset + varuintEncodingLength(size) + size);
  }
  isFinished(): boolean {
    return this.offset >= this.buffer.length;
  }
}

export {
  BytesReader,
}