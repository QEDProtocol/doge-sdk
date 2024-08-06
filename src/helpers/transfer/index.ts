import { encodeP2PKHAddress } from "../../address";
import { hashBuffer, hashHex } from "../../hash";
import { DogeNetworkId } from "../../networks/types";
import { IDogeLinkElectrsRPC } from "../../rpc/electrsTypes";
import { IDogeLinkRPC, IUTXO } from "../../rpc/types";
import { Transaction } from "../../transaction";
import { TransactionBuilder } from "../../transaction/builder";
import { ITransactionOutputAddress } from "../../transaction/types";
import { hexToU8Array } from "../../utils/data";
import { IDogeTransactionSigner } from "../../wallet/types";
import { createP2PKHTransaction } from "../p2pkh";
import { ICreateP2PKHParams, IP2PKHFundingUTXO } from "../p2pkh/types";
async function resolveAddressFromSigner(soa: ICreateP2PKHSimpleCoinSelectParams): Promise<string> {
  if (soa.address) {
    return soa.address;
  }
  const networkId = soa.networkId || soa.rpc?.getNetwork().networkId;
  if(!networkId) {
    throw new Error("No networkId or RPC provided for signer");
  }
  if (soa.signer) {
    const publicKey = await soa.signer.getCompressedPublicKey();
    const address = encodeP2PKHAddress(networkId, hashHex("hash160", publicKey, "binary"));
    return address;
  }
  throw new Error("No signer or address provided");
}
type TTxidOrUTXO = string | IP2PKHFundingUTXO;
type TTxidOrUTXOArray = TTxidOrUTXO | TTxidOrUTXO[];
interface ICreateP2PKHSimpleCoinSelectParamsBase {
  signer?: IDogeTransactionSigner;
  address?: string;
  outputs: ITransactionOutputAddress[]
  feeRate: number;
  inputs?: TTxidOrUTXOArray;
  rpc?: IDogeLinkRPC | IDogeLinkElectrsRPC;
  networkId?: DogeNetworkId;
}

interface ICreateP2PKHSimpleCoinSelectParamsResolved extends ICreateP2PKHSimpleCoinSelectParamsBase {
  address: string;
  outputs: ITransactionOutputAddress[]
  feeRate: number;
  inputs: IP2PKHFundingUTXO[];
}


interface ICreateP2PKHSimpleCoinSelectParamsRPC extends ICreateP2PKHSimpleCoinSelectParamsBase {
  outputs: ITransactionOutputAddress[]
  feeRate: number;
  inputs: TTxidOrUTXOArray;
  rpc: IDogeLinkRPC | IDogeLinkElectrsRPC;
  signer: IDogeTransactionSigner;
}

interface ICreateP2PKHSimpleCoinSelectParamsNetworkId extends ICreateP2PKHSimpleCoinSelectParamsBase {
  outputs: ITransactionOutputAddress[]
  feeRate: number;
  inputs: IP2PKHFundingUTXO[];
  rpc: IDogeLinkRPC | IDogeLinkElectrsRPC;
  networkId: DogeNetworkId;
}

interface ICreateP2PKHSimpleCoinSelectParamsLinkRPC extends ICreateP2PKHSimpleCoinSelectParamsBase {
  outputs: ITransactionOutputAddress[]
  feeRate: number;
  inputs?: TTxidOrUTXOArray;
  rpc: IDogeLinkElectrsRPC;
  signer: IDogeTransactionSigner;
}

type ICreateP2PKHSimpleCoinSelectParams = ICreateP2PKHSimpleCoinSelectParamsResolved | ICreateP2PKHSimpleCoinSelectParamsRPC | ICreateP2PKHSimpleCoinSelectParamsNetworkId;
async function resolveInputs(address: string, params: ICreateP2PKHSimpleCoinSelectParams): Promise<IP2PKHFundingUTXO[]> {
  if(!params.inputs){
    if(!params.rpc || typeof (params.rpc as IDogeLinkElectrsRPC).getUTXOs !== "function") {
      throw new Error("Electrs RPC must be provided when inputs are not provided");
    }
    return (params.rpc as IDogeLinkElectrsRPC).getUTXOs(address);
  }else{

    const inputsBase = await Promise.all((Array.isArray(params.inputs) ? params.inputs : [params.inputs]).map(async (x)=>{
      if(typeof x === "string") {
        if(!params.rpc) {
          throw new Error("RPC must be provided when passing txid as string for inputs");
        }
        const tx = await params.rpc.getTransaction(x);
        return tx.getUTXOsForAddress(address);
      }else{
        return [x];
      }
    }));

    return inputsBase.reduce((a,b)=>a.concat(b), []);
  }
}
async function createP2PKHParamsSimpleCS(params: ICreateP2PKHSimpleCoinSelectParams): Promise<ICreateP2PKHParams> {
  const address = await resolveAddressFromSigner(params);
  const inputs = await resolveInputs(address, params);

  return {
    address,
    inputs,
    outputs: params.outputs,
  }
}

async function createP2PKHTxBuilderSimpleCS(params: ICreateP2PKHSimpleCoinSelectParams & {signer: IDogeTransactionSigner}): Promise<TransactionBuilder> {
  const createParams = await createP2PKHParamsSimpleCS(params);
  const builder = createP2PKHTransaction(params.signer, createParams);
  return builder;
}

async function createP2PKHTxSimpleCS(params: ICreateP2PKHSimpleCoinSelectParams & {signer: IDogeTransactionSigner}): Promise<Transaction> {
  const createParams = await createP2PKHParamsSimpleCS(params);
  const builder = createP2PKHTransaction(params.signer, createParams);
  return builder.finalizeAndSign();
}
export type {
  ICreateP2PKHSimpleCoinSelectParams,
};
export {
  createP2PKHParamsSimpleCS,
  createP2PKHTxBuilderSimpleCS,
  createP2PKHTxSimpleCS,
};
