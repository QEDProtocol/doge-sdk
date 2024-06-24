import { IDogeHTTPClient, ISimpleHTTPRequest } from "../http/types";
import { waitMs } from "../utils/misc";
import { DogeLinkRPC } from "./linkRPC";
import { IDogeLinkRPCInfo, IUTXO } from "./types";

function trimTrailingSlash(s: string) {
  if (s.charAt(s.length - 1) === "/") {
    return s.substring(0, s.length - 1);
  } else {
    return s;
  }
}

function parseErrorMessage(s: any): string {
  if(typeof s === 'string' && s.indexOf("RPC error")!==-1){
    const bracketIndex = s.indexOf("{");
    const bracketIndex2 = s.lastIndexOf("}");
    if(bracketIndex!==-1 && bracketIndex2!==-1){
        const json = s.substring(bracketIndex, bracketIndex2+1);
        let parsed = null;
        try {
          parsed = JSON.parse(json);
        }catch(err){
        }
        if(parsed && parsed.message){
          return parsed.message;
        }else{
          return s;
        }
    }else{
      return s;
    }
  }else{
    return s+"";
  }
}

class DogeLinkElectrsRPC extends DogeLinkRPC {
  electrsURL: string;
  constructor(rpcInfo: IDogeLinkRPCInfo | string, electrsURL: string, httpClient?: IDogeHTTPClient) {
    super(rpcInfo, httpClient);
    this.electrsURL = trimTrailingSlash(electrsURL);
  }
  async sendTx(txHex: string): Promise<string> {
    const url = this.electrsURL + "/tx";
    const request: ISimpleHTTPRequest = {
      url,
      method: "POST",
      body: txHex,
      responseType: "text",
    };

    const result = await this.httpClient.sendRequest(request);
    if (result.statusCode >= 400) {
      throw new Error(parseErrorMessage(result.body));
    }else{
      return result.body;
    }
  }
  async getUTXOs(address: string): Promise<IUTXO[]> {
    const url = this.electrsURL + `/address/${encodeURIComponent(address)}/utxo`;
    const result = await this.httpClient.sendRequest({
      url,
      method: "GET",
      responseType: "json",
    });
    if(result.statusCode >= 400){
      // console.error("Error getting UTXOs: ", result.body);
      throw new Error("Error getting UTXOs");
    }

    return result.body;
  }
  async getBalance(address: string): Promise<number> {
    const utxos = await this.getUTXOs(address);
    return utxos.map(x => x.value).reduce((a, b) => a + b, 0);
  }
  async waitUntilUTXO(address: string, pollInterval = 5000, maxAttempts = -1): Promise<IUTXO[]> {
    for(let i=0;maxAttempts===-1 || i<maxAttempts;i++){
      const data = await this.getUTXOs(address);
      if(data.length>0){
        return data;
      }
      await waitMs(pollInterval);
    }
    throw new Error("waitUntilUTXO: timed out");
  }
  sendRawTransaction(txHex: string): Promise<string> {
    return this.sendTx(txHex);
  }

}

export {
  DogeLinkElectrsRPC,
}