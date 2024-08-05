import { encodeVaruint } from './varuint';

class BytesBuilder {
  bufferSize: number;
  previousBuffers: Uint8Array[] = [];
  buffer: Uint8Array;
  view: DataView;
  offset = 0;
  constructor(bufferSize: number = 1024) {
    this.bufferSize = bufferSize;
    this.buffer = new Uint8Array(bufferSize);
    this.view = new DataView(this.buffer.buffer);
  }
  reserve(size: number): number {
    if (this.offset + size > this.bufferSize) {
      if (this.offset !== this.bufferSize) {
        this.buffer = this.buffer.slice(0, this.offset);
      }
      this.previousBuffers.push(this.buffer);
      const newSize = Math.max(size + 512, 1024);
      this.buffer = new Uint8Array(newSize);
      this.bufferSize = newSize;
      this.view = new DataView(this.buffer.buffer);
      this.offset = 0;
    }
    return size;
  }
  writeByte(byte: number): this {
    this.reserve(1);
    this.buffer[this.offset++] = byte;
    return this;
  }
  writeUint16(value: number, littleEndian = true): this {
    this.reserve(2);
    this.view.setUint16(this.offset, value, littleEndian);
    this.offset += 2;
    return this;
  }
  writeInt32(value: number, littleEndian = true): this {
    this.reserve(4);
    this.view.setInt32(this.offset, value, littleEndian);
    this.offset += 4;
    return this;
  }
  writeUint32(value: number, littleEndian = true): this {
    this.reserve(4);
    this.view.setUint32(this.offset, value, littleEndian);
    this.offset += 4;
    return this;
  }
  writeUint64(value: bigint | number | string, littleEndian = true): this {
    this.reserve(8);
    this.view.setBigUint64(this.offset, BigInt(value), littleEndian);
    this.offset += 8;
    return this;
  }
  writeBytes(bytes: Uint8Array | number[]): this {
    this.reserve(bytes.length);
    if (bytes instanceof Uint8Array) {
      this.buffer.set(bytes, this.offset);
      this.offset += bytes.length;
    } else {
      for (const byte of bytes) {
        this.buffer[this.offset++] = byte;
      }
    }
    return this;
  }
  writeVaruint(value: number): this {
    const data = encodeVaruint(value);
    return this.writeBytes(data);
  }
  writeVarSlice(slice: Uint8Array): this {
    this.writeVaruint(slice.length);
    return this.writeBytes(slice);
  }
  writeVector(vector: Uint8Array[]): this {
    this.writeVaruint(vector.length);
    for (const v of vector) {
      this.writeVarSlice(v);
    }
    return this;
  }
  toBuffer(): Uint8Array {
    if (this.previousBuffers.length === 0) {
      if (this.buffer.length === this.offset) {
        return this.buffer;
      } else {
        return this.buffer.slice(0, this.offset);
      }
    } else {
      const totalLength =
        this.previousBuffers.reduce((acc, buffer) => acc + buffer.length, 0) +
        this.offset;
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of this.previousBuffers) {
        result.set(buffer, offset);
        offset += buffer.length;
      }
      result.set(this.buffer.slice(0, this.offset), offset);
      return result;
    }
  }
}

export { BytesBuilder };
