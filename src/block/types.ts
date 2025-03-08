import type { ITransaction, ITransactionJSON } from "../transaction/types";

interface IAuxPow {
  coinbaseTransaction: ITransaction;
  blockHash: string;
  coinbaseBranch: IMerkleBranch;
  blockchainBranch: IMerkleBranch;
  parentBlock: IStandardBlockHeader;
}


interface IAuxPowJSON {
  coinbaseTransaction: ITransactionJSON;
  blockHash: string;
  coinbaseBranch: IMerkleBranch;
  blockchainBranch: IMerkleBranch;
  parentBlock: IStandardBlockHeader;
}

interface IStandardBlockHeader {
  version: number;
  prevHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: number;
  nonce: number;
}

interface IStandardBlockHeaderAuxPow extends IStandardBlockHeader {
  auxData?: IAuxPow;
}
interface IStandardBlockHeaderAuxPowJSON extends IStandardBlockHeader {
  auxData?: IAuxPowJSON;
}

interface IStandardBlockAuxPow extends IStandardBlockHeaderAuxPow {
  transactions: ITransaction[];
}

interface IStandardBlockAuxPowJSON extends IStandardBlockHeaderAuxPowJSON {
  transactions: ITransactionJSON[];
}

interface IMerkleBranch {
  hashes: string[];
  sideMask: number;
}

export type {
  IAuxPow,
  IAuxPowJSON,
  IStandardBlockHeader,
  IMerkleBranch,
  IStandardBlockHeaderAuxPow,
  IStandardBlockHeaderAuxPowJSON,
  IStandardBlockAuxPow,
  IStandardBlockAuxPowJSON,
}
