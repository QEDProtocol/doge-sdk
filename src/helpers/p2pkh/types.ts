import { ITransactionOutputUser } from "../../transaction/types";

interface IP2PKHFundingUTXO {
  txid: string;
  vout: number;
  value: number;
  sequence?: number;
}

interface IP2PKHFundingUTXOInput {
  txid: string;
  vout?: number;
  value?: number;
  sequence?: number;
}
interface ISpendP2PKHParams {
  inputs: IP2PKHFundingUTXOInput[];
  outputs: ITransactionOutputUser[];
  queryMissingFromRPC?: boolean;
}

interface ICreateP2PKHParams {
  address: string;
  inputs: IP2PKHFundingUTXO[];
  outputs: ITransactionOutputUser[];
}
interface ICreateP2PKHAsyncParams {
  address?: string;
  inputs: IP2PKHFundingUTXO[];
  outputs: ITransactionOutputUser[];
}
interface ICreateP2PKHRPCParams {
  address?: string;
  inputs: IP2PKHFundingUTXOInput[];
  outputs: ITransactionOutputUser[];
}

export type {
  ISpendP2PKHParams,
  ICreateP2PKHAsyncParams,
  ICreateP2PKHRPCParams,
  ICreateP2PKHParams,
  IP2PKHFundingUTXO,
  IP2PKHFundingUTXOInput,
};
