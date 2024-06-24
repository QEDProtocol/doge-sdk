function randomBytesFactory(): (length: number) => Uint8Array {
  if(typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function'){
    const randomBytes = (globalThis as any).require('crypto').randomBytes;
    return (length)=>randomBytes(length);
  }

  return (length)=>(globalThis as any).crypto.getRandomValues(new Uint8Array(length));
}

const cryptoRandomBytes = randomBytesFactory();

export {
  cryptoRandomBytes,
}