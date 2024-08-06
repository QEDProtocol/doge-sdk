import { Block } from '../block';
import { FetchHTTPClient } from '../http/fetchClient';
import { IDogeHTTPClient, ISimpleHTTPRequest } from '../http/types';
import { getDogeNetworkById } from '../networks';
import { DogeNetworkId, IDogeNetwork } from '../networks/types';
import { Transaction } from '../transaction';
import { seq, waitMs } from '../utils/misc';
import {
  IAddressStatsResponse,
  IBasicBlock,
  IBlockStatus,
  IDogeLinkElectrsRPC,
  IGetTXResponse,
  IMempoolRecentTransaction,
  IMempoolStatus,
  IScriptHashStatsResponse,
  ITransactionOutSpend,
  ITXConfirmedStatus,
} from './electrsTypes';
import { IFeeEstimateMap, ITransactionWithStatus, IUTXO } from './types';

function trimTrailingSlash(s: string) {
  if (s.charAt(s.length - 1) === '/') {
    return s.substring(0, s.length - 1);
  } else {
    return s;
  }
}
function queryHelper(query: any) {
  if (!query) {
    return '';
  }
  const queryKeys = Object.keys(query);
  if (queryKeys.length === 0) {
    return '';
  }
  const queryStrings = queryKeys.map((key) => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
  });
  return '?' + queryStrings.join('&');
}
function isScriptHash(s: string): boolean {
  return s.length === 40 && /^[0-9a-fA-F]+$/.test(s);
}
function parseErrorMessage(s: any): string {
  if (typeof s === 'string' && s.indexOf('RPC error') !== -1) {
    const bracketIndex = s.indexOf('{');
    const bracketIndex2 = s.lastIndexOf('}');
    if (bracketIndex !== -1 && bracketIndex2 !== -1) {
      const json = s.substring(bracketIndex, bracketIndex2 + 1);
      let parsed = null;
      try {
        parsed = JSON.parse(json);
      } catch (err) {}
      if (parsed && parsed.message) {
        return parsed.message;
      } else {
        return s;
      }
    } else {
      return s;
    }
  } else {
    return s + '';
  }
}
class DogeLinkElectrsRPC implements IDogeLinkElectrsRPC {
  electrsURL: string;
  networkId: DogeNetworkId;
  httpClient: IDogeHTTPClient;
  constructor(
    electrsURL: string,
    networkId: DogeNetworkId = 'doge',
    httpClient?: IDogeHTTPClient
  ) {
    this.networkId = networkId;
    this.httpClient = httpClient || new FetchHTTPClient();
    this.electrsURL = trimTrailingSlash(electrsURL);
  }
  getFeeEstimateMap(): Promise<IFeeEstimateMap> {
    return this.getJSONElectrs<IFeeEstimateMap>('/fee-estimates');
  }
  async estimateSmartFee(target: number): Promise<number> {
    if (target < 1 || target !== Math.floor(target)) {
      throw new Error('Invalid target blocks for estimateSmartFee: ' + target);
    }
    const feeEstimates = await this.getFeeEstimateMap();
    if (target < 25) {
      const value = (feeEstimates as any)[target];
      if (typeof value === 'number') {
        return value;
      } else {
        throw new Error('Error getting fees for target: ' + target);
      }
    } else {
      if (typeof feeEstimates['25'] !== 'number') {
        throw new Error('Error getting fees for target: ' + target);
      }
      return feeEstimates['25'];
    }
  }
  getNetwork(): IDogeNetwork {
    return getDogeNetworkById(this.networkId);
  }
  getBlockCount(): Promise<number> {
    return this.getJSONElectrs<number>('/blocks/tip/height');
  }
  getRawTransaction(txid: string): Promise<string> {
    return this.getTransactionElectrs(txid, true);
  }
  async getTransaction(txid: string): Promise<Transaction> {
    const raw = await this.getTransactionElectrs(txid, true);
    return Transaction.fromHex(raw);
  }
  getBlockHash(height: number): Promise<string> {
    if (isNaN(height)) {
      throw new Error('Invalid block height: ' + height);
    }
    return this.getTextElectrs('/block-height/' + height);
  }
  getBlockStatus(hash: string): Promise<IBlockStatus> {
    return this.getJSONElectrs<IBlockStatus>('/block/' + hash + '/status');
  }
  mineBlocks(count: number, address?: string | undefined): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  isDoge(): boolean {
    return true;
  }
  getStatsFor(
    addressOrScriptHash: string
  ): Promise<IAddressStatsResponse | IScriptHashStatsResponse> {
    const urlPath = isScriptHash(addressOrScriptHash)
      ? `/scripthash/${addressOrScriptHash}`
      : `/address/${addressOrScriptHash}`;
    return this.getJSONElectrs<
      IAddressStatsResponse | IScriptHashStatsResponse
    >(urlPath);
  }
  getTransactionsFor(
    addressOrScriptHash: string,
    confirmed?: boolean,
    afterTxid?: string
  ): Promise<IGetTXResponse[]> {
    let urlPath = isScriptHash(addressOrScriptHash)
      ? `/scripthash/${addressOrScriptHash}/txs`
      : `/address/${addressOrScriptHash}/txs`;
    if (afterTxid && afterTxid.length === 64) {
      urlPath += confirmed ? `/chain/${afterTxid}` : `/mempool/${afterTxid}`;
    }
    return this.getJSONElectrs<IGetTXResponse[]>(urlPath);
  }
  getBlockBasic(hash: string): Promise<IBasicBlock> {
    const urlPath = `/block/${hash}`;
    return this.getJSONElectrs<IBasicBlock>(urlPath);
  }
  async getBlockGroup(start?: number): Promise<IBasicBlock[]> {
    const urlPath = typeof start === 'number' ? `/blocks/${start}` : '/blocks';
    const blocks = await this.getJSONElectrsMapError<IBasicBlock[]>(
      urlPath,
      {},
      (result) => {
        if (result === 'Block not found') {
          return [];
        } else {
          throw new Error('Error getting block group: ' + result);
        }
      }
    );
    return blocks;
  }
  async getBlock(blockHashOrNumber: string | number): Promise<Block> {
    const blockHash =
      typeof blockHashOrNumber === 'string' && blockHashOrNumber.length === 64
        ? blockHashOrNumber
        : await this.getBlockHash(parseFloat(blockHashOrNumber + ''));
    const blockBuf = new Uint8Array(
      await this.getArrayBufferElectrs(
        `/block/${encodeURIComponent(blockHash)}/raw`
      )
    );
    return Block.fromBuffer(blockBuf);
  }
  async getBlocks(start: number, count: number): Promise<Block[]> {
    const blockGroupsCount = Math.ceil(count / 10);
    const groups = (
      await Promise.all(
        seq(blockGroupsCount).map((i) => this.getBlockGroup(start + i * 10))
      )
    ).reduce((a, b) => a.concat(b), []);
    return Promise.all(groups.map((g) => this.getBlock(g.id)));
  }
  resolveBlockHash(blockHashOrNumber: string | number): Promise<string> {
    if (
      typeof blockHashOrNumber === 'string' &&
      blockHashOrNumber.length === 64
    ) {
      return Promise.resolve(blockHashOrNumber);
    } else {
      return this.getBlockHash(parseFloat(blockHashOrNumber + ''));
    }
  }
  resolveBlockNumber(blockHashOrNumber: string | number): Promise<number> {
    if (typeof blockHashOrNumber === 'number') {
      return Promise.resolve(blockHashOrNumber);
    } else {
      return this.getBlockStatus(blockHashOrNumber).then((x) => x.height);
    }
  }
  async sendTx(txHex: string): Promise<string> {
    const url = this.electrsURL + '/tx';
    const request: ISimpleHTTPRequest = {
      url,
      method: 'POST',
      body: txHex,
      responseType: 'text',
    };

    const result = await this.httpClient.sendRequest(request);
    if (result.statusCode >= 400) {
      throw new Error(parseErrorMessage(result.body));
    } else {
      return result.body;
    }
  }
  async getJSONElectrsMapError<T>(
    urlPath: string,
    query?: any,
    errorHelper?: (result: string) => T
  ): Promise<T> {
    const url = this.electrsURL + urlPath + queryHelper(query);
    const result = await this.httpClient.sendRequest({
      url,
      method: 'GET',
      responseType: 'text',
    });
    if (result.statusCode >= 400) {
      // console.error("Error getting UTXOs: ", result.body);
      throw new Error('error in call to ' + urlPath);
    } else {
      try {
        return JSON.parse(result.body);
      } catch (err) {
        if (typeof errorHelper === 'function') {
          return errorHelper(result.body);
        }
        throw new Error(
          result.body ? result.body : 'error in call to ' + urlPath
        );
      }
    }
  }
  async getJSONElectrs<T>(urlPath: string, query?: any): Promise<T> {
    const url = this.electrsURL + urlPath + queryHelper(query);
    const result = await this.httpClient.sendRequest({
      url,
      method: 'GET',
      responseType: 'text',
    });
    if (result.statusCode >= 400) {
      // console.error("Error getting UTXOs: ", result.body);
      throw new Error('error in call to ' + urlPath);
    } else {
      try {
        return JSON.parse(result.body);
      } catch (err) {
        throw new Error(
          result.body ? result.body : 'error in call to ' + urlPath
        );
      }
    }
  }
  async getTextElectrs(urlPath: string, query?: any): Promise<string> {
    const url = this.electrsURL + urlPath + queryHelper(query);
    const result = await this.httpClient.sendRequest({
      url,
      method: 'GET',
      responseType: 'text',
    });
    if (result.statusCode >= 400) {
      // console.error("Error getting UTXOs: ", result.body);
      throw new Error('error in call to ' + urlPath);
    } else {
      return result.body;
    }
  }
  async getArrayBufferElectrs(
    urlPath: string,
    query?: any
  ): Promise<ArrayBuffer> {
    const url = this.electrsURL + urlPath + queryHelper(query);
    const result = await this.httpClient.sendRequest({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });
    if (result.statusCode >= 400) {
      // console.error("Error getting UTXOs: ", result.body);
      throw new Error('error in call to ' + urlPath);
    } else {
      return result.body;
    }
  }
  async getTransactionElectrs(txid: string): Promise<IGetTXResponse>;
  async getTransactionElectrs(txid: string, rawHex: true): Promise<string>;
  async getTransactionElectrs(
    txid: string,
    rawHex: false
  ): Promise<IGetTXResponse>;
  async getTransactionElectrs(
    txid: string,
    rawHex: undefined
  ): Promise<IGetTXResponse>;
  async getTransactionElectrs(
    txid: string,
    rawHex?: boolean
  ): Promise<IGetTXResponse | string> {
    if (!rawHex) {
      return this.getJSONElectrs<IGetTXResponse>(
        `/tx/${encodeURIComponent(txid)}`
      );
    } else {
      return this.getTextElectrs(`/tx/${encodeURIComponent(txid)}/hex`);
    }
  }
  getTransactionStatusElectrs(txid: string): Promise<ITXConfirmedStatus> {
    return this.getJSONElectrs<ITXConfirmedStatus>(
      `/tx/${encodeURIComponent(txid)}/status`
    );
  }
  async getBlockHeight(): Promise<number> {
    return this.getJSONElectrs<number>('/blocks/tip/height');
  }
  async getBlocksTip(): Promise<number> {
    return this.getJSONElectrs<number>('/blocks/tip/height');
  }
  async getUTXOs(addressOrScriptHash: string): Promise<IUTXO[]> {
    const url = isScriptHash(addressOrScriptHash)
      ? `/scripthash/${addressOrScriptHash}/utxo`
      : `/address/${encodeURIComponent(addressOrScriptHash)}/utxo`;
    return this.getJSONElectrs<IUTXO[]>(url);
  }
  async getBalance(
    addressOrScriptHash: string,
    confirmed = true
  ): Promise<number> {
    const stats = await this.getStatsFor(addressOrScriptHash);
    if (confirmed) {
      return stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum;
    } else {
      return (
        stats.mempool_stats.funded_txo_sum -
        stats.mempool_stats.spent_txo_sum +
        stats.chain_stats.funded_txo_sum -
        stats.chain_stats.spent_txo_sum
      );
    }
  }
  async waitUntilUTXO(
    address: string,
    pollInterval = 5000,
    maxAttempts = -1
  ): Promise<IUTXO[]> {
    for (let i = 0; maxAttempts === -1 || i < maxAttempts; i++) {
      const data = await this.getUTXOs(address);
      if (data.length > 0) {
        return data;
      }
      await waitMs(pollInterval);
    }
    throw new Error('waitUntilUTXO: timed out');
  }
  sendRawTransaction(txHex: string): Promise<string> {
    return this.sendTx(txHex);
  }
  async getMempoolStatus(): Promise<IMempoolStatus> {
    return this.getJSONElectrs<IMempoolStatus>('/mempool');
  }
  async getMempoolRecentTransactions(): Promise<IMempoolRecentTransaction[]> {
    return this.getJSONElectrs<IMempoolRecentTransaction[]>('/mempool/recent');
  }
  getTransactionOutSpends(txid: string): Promise<ITransactionOutSpend[]> {
    return this.getJSONElectrs<ITransactionOutSpend[]>(`/tx/${txid}/outspends`);
  }

  async getTransactionWithStatus(
    txid: string
  ): Promise<ITransactionWithStatus> {
    const tx = await this.getTransaction(txid);
    const status = await this.getTransactionStatusElectrs(txid);
    return {
      transaction: tx,
      status,
    };
  }

  async waitForTransaction(
    txid: string,
    waitUntilConfirmed = false,
    pollInterval: number = 1000,
    maxAttempts = 9999
  ): Promise<ITransactionWithStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        if (waitUntilConfirmed) {
          const status = await this.getTransactionStatusElectrs(txid);
          if (status.confirmed) {
            const tx = await this.getTransaction(txid);
            return {
              transaction: tx,
              status: status,
            };
          }
        } else {
          const tx = await this.getTransaction(txid);
          const status = await this.getTransactionStatusElectrs(txid);
          return {
            transaction: tx,
            status: status,
          };
        }
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    throw new Error('Transaction not found after ' + maxAttempts + ' attempts');
  }
}

export { DogeLinkElectrsRPC };
