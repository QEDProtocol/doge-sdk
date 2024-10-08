import { Block } from "../block";
import { FetchHTTPClient } from "../http/fetchClient";
import { IDogeHTTPClient, ISimpleHTTPRequest } from "../http/types";
import { getDogeNetworkById } from "../networks";
import { Transaction } from "../transaction";
import { hexToU8Array } from "../utils/data";
import { seq } from "../utils/misc";
import { parseDogeLinkNetworkURI } from "./parseNetwork";
import { IDogeRPCGetRawTxResponse } from "./rpcTypes";
import { IDogeLinkRPC, IDogeLinkRPCInfo, IFeeEstimateMap, ITransactionWithStatus } from "./types";

class DogeLinkRPC implements IDogeLinkRPC {
  rpcInfo: IDogeLinkRPCInfo;
  httpClient: IDogeHTTPClient;
  defaultFeeRate: number = 4590;

  constructor(
    rpcInfo: IDogeLinkRPCInfo | string,
    httpClient?: IDogeHTTPClient
  ) {
    if (typeof rpcInfo === "string") {
      this.rpcInfo = parseDogeLinkNetworkURI(rpcInfo);
    } else {
      this.rpcInfo = rpcInfo;
    }
    this.httpClient = httpClient || (new FetchHTTPClient());
  }
  estimateSmartFeeOrFallback(target: number, fallbackFeeRate: number): Promise<number> {
    return this.estimateSmartFee(target).catch(() => fallbackFeeRate);
  }
  async getFeeEstimateMapOrFallback(fallbackFeeRate: number): Promise<IFeeEstimateMap> {
    try {
      const feeMap = await this.getFeeEstimateMap();
      return feeMap;
    }catch(e){
      const fallback: any = {};
      for(let i=1; i<=25; i++){
        fallback[i+''] = fallbackFeeRate;
      }
      return fallback;
    }
  }
  async getTransactionWithStatus(txid: string): Promise<ITransactionWithStatus> {
    const response = await this.command<IDogeRPCGetRawTxResponse>("getrawtransaction", [txid, 1]);
    const tx = Transaction.fromHex(response.hex);
    if(response.confirmations && response.blockhash && response.blocktime){
      const header = await this.command("getblockheader", [response.blockhash, true]);
      return {
        transaction: tx,
        status: {
          confirmed: true,
          block_height: header.height,
          block_hash: response.blockhash,
          block_time: response.blocktime,
          confirmations: header.confirmations,
        }
      }
    }else{
      return {
        transaction: tx,
        status: {
          confirmed: false,
        }
      }
    }
  }
  async waitForTransaction(txid: string, waitUntilConfirmed: boolean = false, pollInterval: number = 1000, maxAttempts: number = 9999): Promise<ITransactionWithStatus> {
    for(let i=0;i<maxAttempts;i++){
      try {
        const response = await this.command<IDogeRPCGetRawTxResponse>("getrawtransaction", [txid, 1]);
        if(response.confirmations && response.blockhash && response.blocktime){
          const header = await this.command("getblockheader", [response.blockhash, true]);
          return {
            transaction: Transaction.fromHex(response.hex),
            status: {
              confirmed: true,
              block_height: header.height,
              block_hash: response.blockhash,
              block_time: response.blocktime,
              confirmations: header.confirmations,
            }
          }
        }else if(!waitUntilConfirmed){
          return {
            transaction: Transaction.fromHex(response.hex),
            status: {
              confirmed: false,
            }
          }
        }
      }catch(e){
      }
      await new Promise((resolve)=>setTimeout(resolve, pollInterval));
    }

    throw new Error("Transaction not found after "+maxAttempts+" attempts");  }

  async getFeeEstimateMap(): Promise<IFeeEstimateMap> {
    const feeEstimates = await Promise.all(seq(25).map(x=>this.estimateSmartFee(x+1)));
    const feeMap: any = {};
    feeEstimates.forEach((x,i)=>{
      feeMap[i+1] = x;
    });
    return feeMap;
  }
  async estimateSmartFee(target: number): Promise<number> {
    const feeResp = await this.command<{feerate: number, blocks: number}>("estimatesmartfee", [target]);
    if(feeResp.feerate <= 0){
      return this.defaultFeeRate;
    }else{
      return feeResp.feerate;
    }
  }
  getNetwork() {
    return getDogeNetworkById(this.rpcInfo.network);
  }
  command<T = any>(
    method: string,
    params: any,
    version = "1.0",
    path = ""
  ): Promise<T> {
    const request: ISimpleHTTPRequest = {
      url: this.rpcInfo.url + path,
      method: "POST",
      credentials: "include",
      headers:
        this.rpcInfo.user && this.rpcInfo.password
          ? {
              "Content-Type": "application/json",
              Authorization:
                "Basic " +
                btoa(this.rpcInfo.user + ":" + this.rpcInfo.password),
            }
          : {
              "Content-Type": "application/json",
            },
      body: JSON.stringify({
        jsonrpc: version,
        method,
        params,
        id: 1,
      }),
      responseType: "json",
    };
    return this.httpClient.sendRequest(request).then(x=>{
      if(x.body.error){
        throw new Error(x.body.error.message || "unknown error");
      }else{
        return x.body.result;
      }
    })
  }

  getBlockCount(): Promise<number> {
    return this.command<number>("getblockcount", []);
  }
  getRawTransaction(txid: string): Promise<string> {
    return this.command<string>("getrawtransaction", [txid]);
  }
  async getTransaction(txid: string): Promise<Transaction> {
    const txHex = await this.getRawTransaction(txid);
    return Transaction.fromHex(txHex);
  }
  getBlockHash(height: number): Promise<string> {
    return this.command<string>("getblockhash", [height]);
  }
  getWalletAddress(walletName = "default") {
    if (this.isDoge()) {
      return this.command<string>("getnewaddress", [], "1.0");
    } else {
      return this.command<string>(
        "getnewaddress",
        [],
        "1.0",
        "wallet/" + encodeURIComponent(walletName)
      );
    }
  }
  mineBlocks(count: number, address = "") {
    if (this.rpcInfo.network === "dogeRegtest") {
      const rAddress = address
        ? Promise.resolve(address)
        : this.getWalletAddress();
      return rAddress.then((address) =>
        this.command<string[]>("generatetoaddress", [count, address])
      );
    } else {
      // disable mine blocks for non regtest networks
      return Promise.resolve(
        ["0000000000000000000000000000000000000000000000000000000000000000"]
      );
    }
  }
  isDoge() {
    return (
      this.rpcInfo.network === "doge" ||
      this.rpcInfo.network === "dogeRegtest" ||
      this.rpcInfo.network === "dogeTestnet"
    );
  }
  sendFromWallet(
    address: string,
    amount: number | string,
    walletName: string = "default"
  ) {
    if (this.isDoge()) {
      // old api
      return this.command<string>(
        "sendtoaddress",
        [address, amount, "", "", true],
        "1.0"
      );
    } else {
      // bitcoin core (latest)
      return this.command<string>(
        "sendtoaddress",
        [address, amount],
        "1.0",
        "wallet/" + encodeURIComponent(walletName)
      );
    }
  }
  sendRawTransaction(txHex: string) {
    return this.command<string>("sendrawtransaction", [txHex]);
  }

  getBlock(blockHashOrNumber: string | number): Promise<Block> {
    const baseHashResult =
      typeof blockHashOrNumber === "string"
        ? Promise.resolve(blockHashOrNumber)
        : this.getBlockHash(blockHashOrNumber);

    return baseHashResult
      .then((r) => this.command("getblock", [r, 0]))
      .then((x) => Block.fromBuffer(hexToU8Array(x)));
  }

  getBlockExtra(blockHashOrNumber: string | number): Promise<any> {
    const baseHashResult =
      typeof blockHashOrNumber === "string"
        ? Promise.resolve(blockHashOrNumber)
        : this.getBlockHash(blockHashOrNumber);

    return baseHashResult
      .then((r) => this.command("getblock", [r, 2]))
      .then((x) => Block.fromBuffer(hexToU8Array(x)));
  }

  getBlocks(start: number, count: number): Promise<Block[]> {
    return Promise.all(
      seq(count, start).map((x) =>
        this.getBlockHash(x)
          .then((hash) => this.command("getblock", [hash, 0]))
          .then((x) => Block.fromBuffer(hexToU8Array(x)))
      )
    );
  }
  resolveBlockHash(blockHashOrNumber: string | number): Promise<string> {
    if (typeof blockHashOrNumber === "number") {
      return this.getBlockHash(blockHashOrNumber);
    } else {
      return Promise.resolve(blockHashOrNumber);
    }
  }
  resolveBlockNumber(blockHashOrNumber: string | number): Promise<number> {
    if (typeof blockHashOrNumber === "string") {
      return this.getBlockExtra(blockHashOrNumber).then((x) => x.height);
    } else {
      return Promise.resolve(blockHashOrNumber);
    }
  }
}

export { DogeLinkRPC };
