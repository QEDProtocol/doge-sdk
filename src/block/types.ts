import { AuxPow } from "./auxpow";

interface IStandardBlockHeader {
  version: number;
  prevHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: number;
  nonce: number;
}

interface IStandardBlockHeaderAuxPow extends IStandardBlockHeader {
  auxData?: AuxPow;
}

interface IMerkleBranch {
  hashes: string[];
  sideMask: number;
}

export type {
  IStandardBlockHeader,
  IMerkleBranch,
  IStandardBlockHeaderAuxPow,
}
