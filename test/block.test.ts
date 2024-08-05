import { blocks } from 'doge-test-data';
import { Block } from "../src";
describe('Block Serialization', () => {
  blocks.forEach((block) => {
    it('deserialize/serialize block '+block.blockNumber, () => {
      const blk = Block.fromHex(block.rawBlock);
      expect(blk.toHex()).toEqual(block.rawBlock);
      expect(blk.getBlockHash()).toEqual(block.blockHash);
      const txHashes = blk.transactions.map(x=>x.getTxid());
      txHashes.forEach((txHash, i)=>{
        expect(txHash).toEqual(block.block.tx[i]);
      });
    });
  });
});
