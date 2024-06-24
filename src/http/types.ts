interface ISimpleHTTPRequest {
  url: string;
  method: string;
  credentials?: "include" | "omit" | "same-origin";
  headers?: Record<string, string>;
  body?: string | ArrayBuffer;
  responseType: "text" | "json" | "arraybuffer";
}
interface ISimpleHTTPResponse {
  statusCode: number;
  body: any;
}

interface IDogeHTTPClient {
  sendRequest(request: ISimpleHTTPRequest): Promise<ISimpleHTTPResponse>;
}

export type {
  ISimpleHTTPRequest,
  ISimpleHTTPResponse,
  IDogeHTTPClient,
};