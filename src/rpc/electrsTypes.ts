import { IDogeLinkRPC, IUTXO } from "./types";

interface ITxVout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}
interface ITxVin {
  txid: string;
  vout: number;
  prevout: ITxVout;
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
}
interface ITxConfirmedStatusFalse {
  confirmed: false;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}
interface ITxConfirmedStatusTrue {
  confirmed: true;
  block_height: number;
  block_hash: string;
  block_time: number;
}
type ITXConfirmedStatus = ITxConfirmedStatusFalse | ITxConfirmedStatusTrue;

interface IGetTXResponse {
  txid: string;
  vin: ITxVin[];
  vout: ITxVout[];
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  status: ITXConfirmedStatus;
}
interface IBasicBlock {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}
interface IBlockStatus {
  in_best_chain: boolean;
  height: number;
  next_best: string;
}

interface IAddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}
interface IAddressStatsResponse {
  address: string;
  chain_stats: IAddressStats;
  mempool_stats: IAddressStats;
}
interface IScriptHashStatsResponse {
  scripthash: string;
  chain_stats: IAddressStats;
  mempool_stats: IAddressStats;
}
interface IMempoolStatus {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: [number, number][];
}
interface IMempoolRecentTransaction {
  txid: string;
  fee: number;
  vsize: number;
  value: number;
}

interface ITransactionOutSpendBase {
  spent: boolean;
  txid?: string;
  vin?: number;
  status?: ITXConfirmedStatus;
  
}
interface ITransactionOutSpendSpent extends ITransactionOutSpendBase {
  spent: true;
  txid: string;
  vin: number;
  status: ITXConfirmedStatus;
}
interface ITransactionOutSpendUnspent extends ITransactionOutSpendBase {
  spent: false;
}
type ITransactionOutSpend = ITransactionOutSpendSpent | ITransactionOutSpendUnspent;

interface IDogeLinkElectrsRPC extends IDogeLinkRPC {
  getBlockStatus(hash: string): Promise<IBlockStatus>;
  getBlockGroup(start?: number): Promise<IBasicBlock[]>;
  getBlockBasic(hash: string): Promise<IBasicBlock>;
  getBalance(address: string): Promise<number>;
  getTransactionsFor(addressOrScriptHash: string, confirmed?: boolean, afterTxid?: string): Promise<IGetTXResponse[]>;
  getStatsFor(addressOrScriptHash: string): Promise<IAddressStatsResponse | IScriptHashStatsResponse>;
  getBlockHeight(): Promise<number>;
  getTransactionElectrs(txId: string): Promise<IGetTXResponse>;
  getTransactionElectrs(txId: string, rawHex: true): Promise<string>;
  getTransactionElectrs(txId: string, rawHex: false): Promise<IGetTXResponse>;
  getTransactionElectrs(txId: string, rawHex: undefined): Promise<IGetTXResponse>;
  getUTXOs(addressOrScriptHash: string): Promise<IUTXO[]>;
  waitUntilUTXO(address: string, pollInterval?: number, maxAttempts?: number): Promise<IUTXO[]>;
  getMempoolStatus(): Promise<IMempoolStatus>;
  getMempoolRecentTransactions(): Promise<IMempoolRecentTransaction[]>;
  getTransactionOutSpends(txid: string): Promise<ITransactionOutSpend[]>;
}
export type {
  ITxVout,
  ITxVin,
  ITxConfirmedStatusFalse,
  ITxConfirmedStatusTrue,
  ITXConfirmedStatus,
  IGetTXResponse,
  IBasicBlock,
  IBlockStatus,
  IAddressStats,
  IAddressStatsResponse,
  IScriptHashStatsResponse,
  IMempoolStatus,
  IMempoolRecentTransaction,
  ITransactionOutSpend,
  IDogeLinkElectrsRPC,
}