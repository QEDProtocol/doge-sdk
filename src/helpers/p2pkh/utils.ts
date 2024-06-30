import { decodeAddress, getP2PKHOutputScript, getAddressFromP2PKHOutputScript } from "../../address";
import { hashHex } from "../../hash";
import { IDogeLinkRPC } from "../../rpc/types";
import { Transaction } from "../../transaction";
import { seq } from "../../utils/misc";
import { IDogeTransactionSigner } from "../../wallet/types";
import { IP2PKHFundingUTXO, IP2PKHFundingUTXOInput } from "./types";

function isNormalizedFundingUTXO(input: IP2PKHFundingUTXOInput): input is IP2PKHFundingUTXO {
  return typeof input.value === "number" && typeof input.vout === "number";
}

class P2PKHTransactionInfoResolver {
  inputs: IP2PKHFundingUTXOInput[];
  rpc?: IDogeLinkRPC;
  signer: IDogeTransactionSigner;
  unresolvedInputIndexes: number[];
  resolvedTransactions: Record<number, Transaction> = {};
  neededTransactions: number[] = [];
  resolvedInputIndexes: number[] = [];
  address: string | undefined;
  lastOutputScript?: Uint8Array;
  constructor(signer: IDogeTransactionSigner, inputs: IP2PKHFundingUTXOInput[], address?: string | undefined, rpc?: IDogeLinkRPC) {
    this.inputs = inputs;
    this.rpc = rpc;
    this.signer = signer;
    this.unresolvedInputIndexes = seq(inputs.length);
    this.neededTransactions = seq(inputs.length).filter(i => !isNormalizedFundingUTXO(inputs[i]));
    this.address = address;
  }
  async resolveTransaction(index: number): Promise<Transaction> {
    if(this.resolvedTransactions[index]){
      return this.resolvedTransactions[index];
    }else if(this.rpc){
      const txHex = await this.rpc.getRawTransaction(this.inputs[index].txid);
      const tx = Transaction.fromHex(txHex);
      this.resolvedTransactions[index] = tx;
      this.resolvedInputIndexes.push(index);
      return tx;
    }else{
      throw new Error('Cannot resolve transaction without RPC');
    }
  }
  async resolveAddress(): Promise<string> {
    if(this.address){
      return this.address;
    }else{
      const lastOutputScript = await this.resolveLastOutputScript();
      const address = getAddressFromP2PKHOutputScript(lastOutputScript, this.rpc!.getNetwork().networkId);
      this.address = address;
      return address;
    }
  }
  async resolveLastOutputScript(): Promise<Uint8Array> {
    if(this.lastOutputScript){
      return this.lastOutputScript;
    }else if(this.address){
      const lastOutputScript = getP2PKHOutputScript(decodeAddress(this.address).hash);
      this.lastOutputScript = lastOutputScript;
      return lastOutputScript;
    }else if(this.rpc){
      const knownVouts = seq(this.inputs.length).filter(i=>typeof this.inputs[i].vout === 'number');
      if(knownVouts.length !== 0){
        const alreadyResolved = knownVouts.filter(i=>this.resolvedInputIndexes.indexOf(i) !== -1);
        if(alreadyResolved.length !== 0){
          const tx = await this.resolveTransaction(alreadyResolved[0]);
          const output = tx.outputs[this.inputs[alreadyResolved[0]].vout as number];
          this.lastOutputScript = output.script;
          return output.script;
        }
      }
    }

    const pubKeyHash = hashHex("hash160", await this.signer.getCompressedPublicKey(), "binary");
    const lastOutputScript = getP2PKHOutputScript(pubKeyHash);
    this.lastOutputScript = lastOutputScript;
    return lastOutputScript;
  }
  async resolveInputs(): Promise<{inputs: IP2PKHFundingUTXO[], lastOutputScript: Uint8Array}> {
    const resolvedInputs: IP2PKHFundingUTXO[] = [];
    for(const index of this.unresolvedInputIndexes){
      if(isNormalizedFundingUTXO(this.inputs[index])){
        resolvedInputs.push(this.inputs[index] as IP2PKHFundingUTXO);
      }else{
        const tx = await this.resolveTransaction(index);
        let vOuts = typeof this.inputs[index].vout === 'number' ? [this.inputs[index].vout as number] : [];
        if(!vOuts.length){
          vOuts = tx.getVoutsForAddress(await this.resolveAddress());
        }
        if(!vOuts.length){
          throw new Error('Cannot find output for address '+await this.resolveAddress());
        }
        vOuts.forEach(vout => {
          const output = tx.outputs[vout];
          resolvedInputs.push({
            txid: this.inputs[index].txid,
            vout: vout,
            value: output.value,
            sequence:this.inputs[index].sequence,
          });
        });
      }
    }
    const lastOutputScript = await this.resolveLastOutputScript();

    return {
      inputs: resolvedInputs,
      lastOutputScript,
    };
  }

}

export {
  P2PKHTransactionInfoResolver,
  isNormalizedFundingUTXO,
}