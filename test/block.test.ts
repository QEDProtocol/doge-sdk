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
      expect(!!blk.auxData).toBe(!!block.block.auxpow);
      if(blk.auxData){
        expect(blk.auxData.coinbaseTransaction.toHex()).toEqual(block.block.auxpow?.tx.hex);
      }
    });
    it('deserialize/serialize json block '+block.blockNumber, () => {
      const blk = Block.fromHex(block.rawBlock);
      const blockJSONString = JSON.stringify(blk.toBlockJSON());
      const blockJSON = JSON.parse(blockJSONString);
      const reserializedBlock = Block.fromBlockJSON(blockJSON);

      expect(blk.getBlockHash()).toBe(reserializedBlock.getBlockHash());
      expect(blk.toHex()).toBe(reserializedBlock.toHex());
      expect(blockJSONString).toBe(JSON.stringify(reserializedBlock.toBlockJSON()));
    });
  });
});
