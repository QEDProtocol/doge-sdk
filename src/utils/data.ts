function isHexString(s: string): boolean {
  return /^[0-9A-Fa-f]*$/.test(s) && s.length % 2 === 0;
}
function assertIsHexString(s: string): void {
  if (!isHexString(s)) {
    throw new Error("expected hex string, got '" + s+"'");
  }
}
function u8ArrayToHex(x: Uint8Array | number[]): string {
  const output: string[] = [];
  for (let i = 0, l = x.length; i < l; i++) {
    output[i] = x[i] < 0x10 ? ("0" + x[i].toString(16)) : x[i].toString(16);
  }
  return output.join("");
}

function u8ArrayToHexReversed(x: Uint8Array | number[]): string {
  const output: string[] = [];
  const len = x.length;
  for (let i = 0; i < len; i++) {
    output[len-1-i] = x[i] < 0x10 ? ("0" + x[i].toString(16)) : x[i].toString(16);
  }
  return output.join("");
}

function hexToU8Array(hex: string): Uint8Array {
  assertIsHexString(hex);
  let hexString = hex.charAt(1) === "x" ? hex.substring(2) : hex;
  if (hexString.length % 2 === 1) {
    throw new Error("hex strings must have an even number of characters");
  }
  const output = new Uint8Array(hexString.length / 2);
  for (let i = 0, l = hexString.length / 2; i < l; i++) {
    output[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return output;
}

function hexToU8ArrayReversed(hex: string): Uint8Array {
  assertIsHexString(hex);
  let hexString = hex.charAt(1) === "x" ? hex.substring(2) : hex;
  if (hexString.length % 2 === 1) {
    throw new Error("hex strings must have an even number of characters");
  }
  const outputLength = hexString.length / 2;
  const output = new Uint8Array(outputLength);
  for (let i = 0, l = hexString.length / 2; i < l; i++) {
    output[outputLength-1-i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return output;
}

function compareU8Array(a: Uint8Array, b: Uint8Array): boolean {
  if(a.length !== b.length){
    return false;
  }
  const len = a.length;
  for(let i = 0; i < len; i++){
    if(a[i] !== b[i]){
      return false;
    }
  }
  return true;
}

export {
  u8ArrayToHex,
  hexToU8Array,
  compareU8Array,
  hexToU8ArrayReversed,
  u8ArrayToHexReversed,
  isHexString,
  assertIsHexString,
}