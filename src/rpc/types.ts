import { DogeNetworkId } from "../networks/types";


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
}