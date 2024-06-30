import { Block } from "../block";
import { DogeNetworkId, IDogeNetwork } from "../networks/types";
import { Transaction } from "../transaction";
interface IDogeLinkRPC {
  getNetwork(): IDogeNetwork;
  getBlockCount(): Promise<number>;
  getRawTransaction(txId: string): Promise<string>;
  getTransaction(txId: string): Promise<Transaction>;
  getBlockHash(height: number): Promise<string>;
  mineBlocks(count: number, address?: string): Promise<string[]>;
  isDoge(): boolean;
  sendRawTransaction(txHex: string): Promise<string>;
  getBlock(blockHashOrNumber: string | number): Promise<Block>;
  getBlocks(start: number, count: number): Promise<Block[]>;
  resolveBlockHash(blockHashOrNumber: string | number): Promise<string>;
  resolveBlockNumber(blockHashOrNumber: string | number): Promise<number>;
}

interface IDogeLinkRPCInfo {
  network: DogeNetworkId;
  url: string;
  fullUrl: string;
  user?: string;
  password?: string;
}


interface IBaseUTXO {
  txid: string;
  vout: number;
  value: number;
}
interface IUTXO extends IBaseUTXO {
  status: {
      confirmed: boolean;
      block_height: number;
      block_hash: string;
      block_time: number;
  };
}

interface IUTXOWithRawTransaction extends IUTXO {
  rawTransaction: Uint8Array;
}
export type {
  IUTXOWithRawTransaction,
  IUTXO,
  IBaseUTXO,
  IDogeLinkRPCInfo,
  IDogeLinkRPC,
}