import { hashBuffer } from '../hash';
import { convertRadix } from './convertRadix';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function decodeBase58ToDigits(str: string): number[] {
  const digits: number[] = [];
  for (let i = 0, l = str.length; i < l; i++) {
    const char = str[i];
    const digit = ALPHABET.indexOf(char);
    if (digit === -1) {
      throw new Error(`Invalid character found: ${char}`);
    }
    digits.push(digit);
  }
  return digits;
}

function encodeBase58FromDigits(digits: number[]): string {
  const chars: string[] = [];
  for (let i = 0, l = digits.length; i < l; i++) {
    const digit = digits[i];
    const char = ALPHABET[digit];
    if (typeof char !== 'string') {
      throw new Error(`Invalid digit found: ${digit}`);
    }
    chars.push(char);
  }
  return chars.join('');
}

function decodeBase58(data: string): Uint8Array {
  const digits = decodeBase58ToDigits(data);
  const bytes = convertRadix(digits, 58, 256);
  return new Uint8Array(bytes);
}

function encodeBase58(data: Uint8Array): string {
  const digits = convertRadix(data, 256, 58);
  return encodeBase58FromDigits(digits);
}

function decodeBase58WithChecksum(data: string): Uint8Array {
  const bytes = decodeBase58(data);
  if (bytes.length < 4) {
    throw new Error('Invalid checksum');
  }
  const payload = bytes.subarray(0, bytes.length - 4);
  const checksum = bytes.subarray(bytes.length - 4);
  const expectedChecksum = hashBuffer('hash256', payload).subarray(0, 4);

  const checksumIsCorrect =
    expectedChecksum[0] === checksum[0] &&
    expectedChecksum[1] === checksum[1] &&
    expectedChecksum[2] === checksum[2] &&
    expectedChecksum[3] === checksum[3];
  if (!checksumIsCorrect) {
    throw new Error('Invalid checksum');
  }
  return payload;
}

function encodeBase58WithChecksum(data: Uint8Array): string {
  const checksum = hashBuffer('hash256', data).subarray(0, 4);
  const payload = new Uint8Array(data.length + 4);
  payload.set(data, 0);
  payload.set(checksum, data.length);
  return encodeBase58(payload);
}

export {
  decodeBase58,
  encodeBase58,
  decodeBase58WithChecksum,
  encodeBase58WithChecksum,
};
