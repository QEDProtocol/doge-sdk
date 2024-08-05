type THash256 = Uint8Array;

interface ITransactionInputWithoutScript {
  hash: THash256;
  index: number;
  sequence: number;
}
interface ITransactionInput extends ITransactionInputWithoutScript {
  script: Uint8Array;
  witness?: Uint8Array[];
}

interface ITransactionOutput {
  value: number;
  script: Uint8Array;
}

interface ITransactionOutputAddress {
  value: number;
  address: string;
}
type ITransactionOutputUser = ITransactionOutputAddress | ITransactionOutput;

interface ITransaction {
  version: number;
  inputs: ITransactionInput[];
  outputs: ITransactionOutput[];
  locktime: number;
}

interface ISigHashPreimage<T extends ITransaction = ITransaction> {
  transaction: T;
  sighashType: number;
}

export type {
  THash256,
  ITransactionInputWithoutScript,
  ITransactionInput,
  ITransactionOutput,
  ITransaction,
  ISigHashPreimage,
  ITransactionOutputUser,
  ITransactionOutputAddress,
};