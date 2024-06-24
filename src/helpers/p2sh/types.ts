import { ITransactionOutputUser } from "../../transaction/types";
import { IDogeTransactionSigner } from "../../wallet/types";

interface IP2SHFundingUTXO {
  txid: string;
  vout: number;
  value: number;
  sequence?: number;
  signers?: IDogeTransactionSigner[];
}


interface ICreateP2SHParamsBase {
  unlockScript?: Uint8Array[] | Uint8Array;
  unlockScriptBASM?: string;
  redeemScript?: Uint8Array;
  redeemScriptBASM?: string;
  inputs: IP2SHFundingUTXO[];
  outputs: ITransactionOutputUser[];
  signers?: IDogeTransactionSigner[];
}

type HasUnlockScript = {unlockScript: Uint8Array[] | Uint8Array} | {unlockScriptBASM: string};
type HasRedeemScript = {redeemScript: Uint8Array} | {redeemScriptBASM: string};
type ICreateP2SHParams = ICreateP2SHParamsBase & HasUnlockScript & HasRedeemScript;


export type {
  IP2SHFundingUTXO,
  ICreateP2SHParams,
}