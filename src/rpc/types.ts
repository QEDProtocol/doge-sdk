import { Block } from "../block";
import { DogeNetworkId, IDogeNetwork } from "../networks/types";
import { Transaction } from "../transaction";
import { ITXConfirmedStatus } from "./electrsTypes";

interface ITransactionWithStatus {
  transaction: Transaction;
  status: ITXConfirmedStatus;
}

interface IDogeLinkRPC {
  getNetwork(): IDogeNetwork;
  getBlockCount(): Promise<number>;
  getRawTransaction(txid: string): Promise<string>;
  getTransaction(txid: string): Promise<Transaction>;
  getTransactionWithStatus(txid: string): Promise<ITransactionWithStatus>;
  getBlockHash(height: number): Promise<string>;
  mineBlocks(count: number, address?: string): Promise<string[]>;
  isDoge(): boolean;
  sendRawTransaction(txHex: string): Promise<string>;
  getBlock(blockHashOrNumber: string | number): Promise<Block>;
  getBlocks(start: number, count: number): Promise<Block[]>;
  resolveBlockHash(blockHashOrNumber: string | number): Promise<string>;
  resolveBlockNumber(blockHashOrNumber: string | number): Promise<number>;
  getFeeEstimateMap(): Promise<IFeeEstimateMap>;
  estimateSmartFee(target: number): Promise<number>;
  estimateSmartFeeOrFallback(target: number, fallbackFeeRate: number): Promise<number>;
  getFeeEstimateMapOrFallback(fallbackFeeRate: number): Promise<IFeeEstimateMap>;

  waitForTransaction(txid: string, waitUntilConfirmed?: boolean, pollInterval?: number, maxAttempts?: number): Promise<ITransactionWithStatus>;
}
interface IFeeEstimateMap {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  "6": number;
  "7": number;
  "8": number;
  "9": number;
  "10": number;
  "11": number;
  "12": number;
  "13": number;
  "14": number;
  "15": number;
  "16": number;
  "17": number;
  "18": number;
  "19": number;
  "20": number;
  "21": number;
  "22": number;
  "23": number;
  "24": number;
  "25": number;
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
  IFeeEstimateMap,
  ITransactionWithStatus,
}
