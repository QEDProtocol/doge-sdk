import { decodeAddress, getP2PKHOutputScript, getAddressFromP2PKHOutputScript } from "../../address";
import { hashHex } from "../../hash";
import { DogeLinkRPC } from "../../rpc";
import { TransactionBuilder } from "../../transaction/builder";
import { normailzeTransactionOutput } from "../../transaction/normalize";
import { ITransactionOutputUser } from "../../transaction/types";
import { hexToU8ArrayReversed } from "../../utils/data";
import { IDogeTransactionSigner } from "../../wallet/types";
import { ICreateP2PKHAsyncParams, ICreateP2PKHParams, ICreateP2PKHRPCParams, IP2PKHFundingUTXO } from "./types";
import { P2PKHTransactionInfoResolver } from "./utils";

function createP2PKHTransactionInternal(signer: IDogeTransactionSigner, publicKeyHash: Uint8Array, inputs: IP2PKHFundingUTXO[], outputs: ITransactionOutputUser[]): TransactionBuilder {
  const transaction = new TransactionBuilder();
  inputs.forEach(input => {
    transaction.addInput({
      hash: hexToU8ArrayReversed(input.txid),
      index: input.vout,
      lockScript: getP2PKHOutputScript(publicKeyHash),
      sequence: input.sequence,
      value: input.value,
      signers: [signer],
    });
  });
  outputs.forEach(output => {
    transaction.addOutput(normailzeTransactionOutput(output));
  });
  return transaction;
}

function createP2PKHTransaction(signer: IDogeTransactionSigner, params: ICreateP2PKHParams): TransactionBuilder {
  const publicKeyHash =  decodeAddress(params.address).hash;
  return createP2PKHTransactionInternal(signer, publicKeyHash, params.inputs, params.outputs);
}

async function createP2PKHTransactionAsync(signer: IDogeTransactionSigner, params: ICreateP2PKHAsyncParams): Promise<TransactionBuilder> {
  if(params.address) {
    const publicKeyHash = decodeAddress(params.address).hash;
    return createP2PKHTransactionInternal(signer, publicKeyHash, params.inputs, params.outputs);
  }else{
    const publicKey = await signer.getCompressedPublicKey();
    const publicKeyHash = hashHex("hash160", publicKey, "binary"); 
    return createP2PKHTransactionInternal(signer, publicKeyHash, params.inputs, params.outputs);
  }
}
async function resolveP2PKHParams(rpc: DogeLinkRPC, signer: IDogeTransactionSigner, params: ICreateP2PKHRPCParams): Promise<ICreateP2PKHParams> {
  const resolver = new P2PKHTransactionInfoResolver(signer, params.inputs, params.address, rpc);
  const {inputs, lastOutputScript} = await resolver.resolveInputs();
  const address = getAddressFromP2PKHOutputScript(lastOutputScript, rpc.getNetwork().networkId);
  return {inputs, outputs: params.outputs, address};
}

export {
  createP2PKHTransaction,
  createP2PKHTransactionAsync,
  resolveP2PKHParams,
}