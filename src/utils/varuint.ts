/*
Varuint encoding and decoding for Bitcoin, ported from varuint-bitcoin to use DateView instead of Buffer.

varuint-bitcoin code: 
https://github.com/bitcoinjs/varuint-bitcoin/blob/8342fe7362f20a412d61b9ade20839aafaa7f78e/index.js

varuint-bitcoin license:
The MIT License (MIT)

Copyright (c) 2016 Kirill Fomichev

Parts of this software are based on https://github.com/mappum/bitcoin-protocol
Copyright (c) 2016 Matt Bell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;

function isUint53(n: number) {
  return n >= 0 && n <= MAX_SAFE_INTEGER && n % 1 === 0;
}

function encodeVaruint(n: number, buffer?: Uint8Array, offset = 0): Uint8Array {
  if (!isUint53(n)) {
    throw new TypeError('value must be a uint53');
  }

  const destBuffer = buffer ? buffer : new Uint8Array(varuintEncodingLength(n));
  if (!(destBuffer.buffer instanceof ArrayBuffer)) {
    throw new TypeError('buffer must be an instance of Uint8Array');
  }
  const view = new DataView(destBuffer.buffer);

  if (n < 0xfd) {
    // 8 bit
    view.setUint8(offset, n);
  } else if (n <= 0xffff) {
    // 16 bit
    view.setUint8(0xfd, offset);
    view.setUint16(n, offset + 1, true);
  } else if (n <= 0xffffffff) {
    // 32 bit
    view.setUint8(0xfe, offset);
    view.setUint32(n, offset + 1, true);
  } else {
    // 64 bit
    view.setUint8(0xff, offset);
    view.setUint32(n >>> 0, offset + 1, true);
    view.setUint32((n / 0x100000000) | 0, offset + 5, true);
  }
  return destBuffer;
}

function decodeVaruint(buffer: Uint8Array, offset = 0): number {
  if (!(buffer.buffer instanceof ArrayBuffer)) {
    throw new TypeError('buffer must be an instance of Uint8Array');
  }
  const view = new DataView(buffer.buffer);

  var first = view.getUint8(offset);

  if (first < 0xfd) {
    // 8 bit
    return first;
  } else if (first === 0xfd) {
    // 16 bit
    return view.getUint16(offset + 1, true);
  } else if (first === 0xfe) {
    // 32 bit
    return view.getUint32(offset + 1, true);
  } else {
    // 64 bit
    const lo = view.getUint32(offset + 1, true);
    const hi = view.getUint32(offset + 5, true);
    const n = hi * 0x0100000000 + lo;

    if (!isUint53(n)) {
      throw new TypeError('value must be a uint53');
    }

    return n;
  }
}

function varuintEncodingLength(n: number) {
  if (!isUint53(n)) {
    throw new TypeError('value must be a uint53');
  }

  return n < 0xfd ? 1 : n <= 0xffff ? 3 : n <= 0xffffffff ? 5 : 9;
}


export {
  varuintEncodingLength,
  encodeVaruint,
  decodeVaruint,
}