interface IDogeRPCGetRawTxResponse {
  hex: string;
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: IDogeRPCVin[];
  vout: IDogeRPCVout[];
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}

interface IDogeRPCVin {
  txid: string;
  vout: number;
  scriptSig: IDogeRPCScriptSig;
  sequence: number;
}

interface IDogeRPCScriptSig {
  asm: string;
  hex: string;
}

interface IDogeRPCVout {
  value: number;
  n: number;
  scriptPubKey: IDogeRPCScriptPubKey;
}

interface IDogeRPCScriptPubKey {
  asm: string;
  hex: string;
  reqSigs: number;
  type: string;
  addresses: string[];
}

export type { IDogeRPCGetRawTxResponse };
