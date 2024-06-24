import { IDogeTransactionSigner } from "../wallet/types";
import { ITransactionInputWithoutScript } from "./types";

interface IPartialSig {
  pubkey: Uint8Array;
  signature: Uint8Array;
}
interface IFinalizerInfo {
  redeemScript?: Uint8Array;
  unlockScript: Uint8Array[];
  inputIndex: number;
  input: INormalizedTransactionBuilderInput;
  signatures: IPartialSig[];
  sigHashType: number;
  sigHashPreimage: Uint8Array;
  sigHash: Uint8Array;
}

interface INormalizedTransactionBuilderInput extends ITransactionInputWithoutScript{
  lockScript: Uint8Array;
  redeemScript?: Uint8Array;
  signatures?: IPartialSig[];
  signers?: IDogeTransactionSigner[];
  sigHashType?: number;
  unlockScript?: Uint8Array[];
  finalizer?: (info: IFinalizerInfo) => Promise<Uint8Array>;
}
interface ITransactionBuilderInput {
  hash: string | Uint8Array;
  index: number;
  nonWitnessUtxo?: Uint8Array;
  sequence?: number;
  redeemScript?: Uint8Array;
  lockScript?: Uint8Array;
  value: number;
  signatures?: IPartialSig[];
  signers?: IDogeTransactionSigner[];
  unlockScript?: Uint8Array[];
  finalizer?: (info: IFinalizerInfo) => Promise<Uint8Array>;
}
export type {
  ITransactionBuilderInput,
  IFinalizerInfo,
  IPartialSig,
  INormalizedTransactionBuilderInput,

}