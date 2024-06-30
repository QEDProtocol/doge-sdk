import { Block } from '../block'
import { IDogeHTTPClient } from '../http/types'
import { IDogeNetwork } from '../networks/types'
import { Transaction } from '../transaction'
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
} from './electrsTypes'
import { DogeLinkElectrsRPC } from './linkElectrs'
import { DogeLinkRPC } from './linkRPC'
import { IDogeLinkRPC, IDogeLinkRPCInfo, IUTXO } from './types'

class DogeLinkElectrsComboRPC implements IDogeLinkElectrsRPC {
  rpc: IDogeLinkRPC
  electrsRPC: IDogeLinkElectrsRPC
  constructor(
    rpcInfo: IDogeLinkRPCInfo | string,
    electrsURL: string,
    httpClient?: IDogeHTTPClient
  ) {
    const rpc = new DogeLinkRPC(rpcInfo, httpClient)
    this.rpc = rpc
    const electrsRPC = new DogeLinkElectrsRPC(
      electrsURL,
      rpc.getNetwork().networkId,
      httpClient
    )
    this.electrsRPC = electrsRPC
  }
  getBlockStatus(hash: string): Promise<IBlockStatus> {
    return this.electrsRPC.getBlockStatus(hash)
  }
  getBlockGroup(start?: number | undefined): Promise<IBasicBlock[]> {
    return this.electrsRPC.getBlockGroup(start)
  }
  getBlockBasic(hash: string): Promise<IBasicBlock> {
    return this.electrsRPC.getBlockBasic(hash)
  }
  getBalance(address: string): Promise<number> {
    return this.electrsRPC.getBalance(address)
  }
  getTransactionsFor(
    addressOrScriptHash: string,
    confirmed?: boolean | undefined,
    afterTxid?: string | undefined
  ): Promise<IGetTXResponse[]> {
    return this.electrsRPC.getTransactionsFor(
      addressOrScriptHash,
      confirmed,
      afterTxid
    )
  }
  getStatsFor(
    addressOrScriptHash: string
  ): Promise<IAddressStatsResponse | IScriptHashStatsResponse> {
    return this.electrsRPC.getStatsFor(addressOrScriptHash)
  }
  getBlockHeight(): Promise<number> {
    return this.electrsRPC.getBlockHeight()
  }
  getTransactionElectrs(txId: string): Promise<IGetTXResponse>
  getTransactionElectrs(txId: string, rawHex: true): Promise<string>
  getTransactionElectrs(txId: string, rawHex: false): Promise<IGetTXResponse>
  getTransactionElectrs(
    txId: string,
    rawHex?: boolean
  ): Promise<string> | Promise<IGetTXResponse> {
    return this.electrsRPC.getTransactionElectrs(txId as string, rawHex as any)
  }
  getUTXOs(addressOrScriptHash: string): Promise<IUTXO[]> {
    return this.electrsRPC.getUTXOs(addressOrScriptHash)
  }
  waitUntilUTXO(
    address: string,
    pollInterval?: number | undefined,
    maxAttempts?: number | undefined
  ): Promise<IUTXO[]> {
    return this.electrsRPC.waitUntilUTXO(address, pollInterval, maxAttempts)
  }
  getMempoolStatus(): Promise<IMempoolStatus> {
    return this.electrsRPC.getMempoolStatus()
  }
  getMempoolRecentTransactions(): Promise<IMempoolRecentTransaction[]> {
    return this.electrsRPC.getMempoolRecentTransactions()
  }
  getTransactionOutSpends(txid: string): Promise<ITransactionOutSpend[]> {
    return this.electrsRPC.getTransactionOutSpends(txid)
  }
  getNetwork(): IDogeNetwork {
    return this.rpc.getNetwork()
  }
  getBlockCount(): Promise<number> {
    return this.rpc.getBlockCount()
  }
  getRawTransaction(txId: string): Promise<string> {
    return this.rpc.getRawTransaction(txId)
  }
  getTransaction(txId: string): Promise<Transaction> {
    return this.rpc.getTransaction(txId)
  }
  getBlockHash(height: number): Promise<string> {
    return this.rpc.getBlockHash(height)
  }
  mineBlocks(count: number, address?: string | undefined): Promise<string[]> {
    return this.rpc.mineBlocks(count, address)
  }
  isDoge(): boolean {
    return this.rpc.isDoge()
  }
  sendRawTransaction(txHex: string): Promise<string> {
    return this.rpc.sendRawTransaction(txHex)
  }
  getBlock(blockHashOrNumber: string | number): Promise<Block> {
    return this.rpc.getBlock(blockHashOrNumber)
  }
  getBlocks(start: number, count: number): Promise<Block[]> {
    return this.rpc.getBlocks(start, count)
  }
  resolveBlockHash(blockHashOrNumber: string | number): Promise<string> {
    return this.rpc.resolveBlockHash(blockHashOrNumber)
  }
  resolveBlockNumber(blockHashOrNumber: string | number): Promise<number> {
    return this.rpc.resolveBlockNumber(blockHashOrNumber)
  }
}

export { DogeLinkElectrsComboRPC }
