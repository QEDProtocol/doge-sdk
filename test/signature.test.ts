import { DogeMemoryWallet, DogeMemoryWalletProvider, hexToU8Array, ISignatureResult, isValidDERSignatureEncoding, isValidDERSignatureEncodingInternal, u8ArrayToHex } from "../src";
import { seq } from "../src/utils/misc";
import { insecurePseudoRandomBytes } from "../src/utils/random";

describe('Signatures', () => {
  // test wallets for all supported networks
  const randomSignatures: ISignatureResult[] = [];
  beforeAll(async () => {
    const sigs = await Promise.all(seq(1000).map(x=>DogeMemoryWallet.generateRandom("dogeTestnet").signHash(u8ArrayToHex(insecurePseudoRandomBytes(32)))));
    sigs.forEach(s=>randomSignatures.push(s));
  });

  it('check random signature serialization', () => {
    randomSignatures.forEach(sig=>{
      const sigBytes = hexToU8Array(sig.signature+"01");
      expect(isValidDERSignatureEncodingInternal(sigBytes)).toBe(0);
    })
  });
});
