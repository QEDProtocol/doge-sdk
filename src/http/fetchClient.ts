import { IDogeHTTPClient, ISimpleHTTPRequest, ISimpleHTTPResponse } from "./types";

class FetchHTTPClient implements IDogeHTTPClient {
  fetchImplementation: any;
  constructor(fetchImplementation?: any){
    if(fetchImplementation){
      this.fetchImplementation = fetchImplementation;
    }else if(typeof globalThis.fetch === 'function'){
      this.fetchImplementation = globalThis.fetch;
    }else{
      throw new Error('No fetch implementation provided');
    }
  }
  async sendRequest(request: ISimpleHTTPRequest): Promise<ISimpleHTTPResponse> {
    //@ts-ignore
    const result = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      credentials: request.credentials,
    });
    if(!result.ok){
      if(request.responseType === "json"){
        try {
          const body = await result.json();
          return {
            statusCode: result.status,
            body,
          };
        }catch(e){
          return {
            statusCode: result.status,
            body: null,
          };
        }
      }
    }
    if(request.responseType === "json"){
      return {
        statusCode: result.status,
        body: await result.json(),
      };
    }else if(request.responseType === "text"){
      return {
        statusCode: result.status,
        body: await result.text(),
      };
    }else{
      return {
        statusCode: result.status,
        body: await result.arrayBuffer(),
      };
    }

  }
}


export {
  FetchHTTPClient,
}