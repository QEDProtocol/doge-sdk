

// This is taken from https://github.com/paulmillr/scure-base/blob/3332d8d732351b765188069c32a0dbab90c09064/index.ts#L154

/*
The MIT License (MIT)

Copyright (c) 2022 Paul Miller (https://paulmillr.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */

/**
 * Slow: O(n^2) time complexity
 * @__NO_SIDE_EFFECTS__
 */
function convertRadix(data: number[] | Uint8Array, from: number, to: number) {
  // base 1 is impossible
  if (from < 2) throw new Error(`convertRadix: invalid from=${from}, base cannot be less than 2`);
  if (to < 2) throw new Error(`convertRadix: invalid to=${to}, base cannot be less than 2`);
  if (!Array.isArray(data) && !(data instanceof Uint8Array)) throw new Error('convertRadix: data should be array');
  if (!data.length) return [];
  let pos = 0;
  const res: number[] = [];
  const digits = Array.from(data);
  digits.forEach((d) => {
    if (!Number.isSafeInteger(d)) throw new Error(`Invalid digit: ${d}`);
    if (d < 0 || d >= from) throw new Error(`Invalid digit: ${d}`);
  });
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < digits.length; i++) {
      const digit = digits[i]!;
      const digitBase = from * carry + digit;
      if (
        !Number.isSafeInteger(digitBase) ||
        (from * carry) / from !== carry ||
        digitBase - digit !== from * carry
      ) {
        throw new Error('convertRadix: carry overflow');
      }
      carry = digitBase % to;
      const rounded = Math.floor(digitBase / to);
      digits[i] = rounded;
      if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
        throw new Error('convertRadix: carry overflow');
      if (!done) continue;
      else if (!rounded) pos = i;
      else done = false;
    }
    res.push(carry);
    if (done) break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);
  return res.reverse();
}


export {
  convertRadix,
}