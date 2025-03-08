type THash256 = Uint8Array;
type THexString = string;

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

interface ITransactionInputWithoutScriptJSON {
  hash: THexString;
  index: number;
  sequence: number;
}
interface ITransactionInputJSON extends ITransactionInputWithoutScriptJSON {
  script: THexString;
  witness?: THexString[];
}

interface ITransactionOutputJSON {
  value: number;
  script: THexString;
}

type ITransactionOutputUserJSON = ITransactionOutputAddress | ITransactionOutputJSON;

interface ITransactionJSON {
  version: number;
  inputs: ITransactionInputJSON[];
  outputs: ITransactionOutputJSON[];
  locktime: number;
}


export type {
  THash256,
  THexString,
  
  ITransactionInputWithoutScript,
  ITransactionInput,
  ITransactionOutput,
  ITransaction,
  ISigHashPreimage,
  ITransactionOutputUser,
  ITransactionOutputAddress,

  ITransactionInputWithoutScriptJSON,
  ITransactionInputJSON,
  ITransactionOutputJSON,
  ITransactionOutputUserJSON,
  ITransactionJSON,


};
