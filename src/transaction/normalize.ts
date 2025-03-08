import { addressToOutputScript } from "../address";
import { hexToU8Array, u8ArrayToHex } from "../utils/data";
import type { ITransaction, ITransactionJSON, ITransactionOutput, ITransactionOutputAddress, ITransactionOutputUser } from "./types";

function normailzeTransactionOutput(output: ITransactionOutputUser): ITransactionOutput {
  if((output as ITransactionOutputAddress).address) {
    return {
      value: output.value,
      script: addressToOutputScript((output as ITransactionOutputAddress).address)
    }
  }else{
    return output as ITransactionOutput;
  }
}


function txJSONToTx(tx: ITransactionJSON): ITransaction {
  return {
    version: tx.version,
    inputs: tx.inputs.map(input=>({
      hash: hexToU8Array(input.hash),
      index: input.index,
      sequence: input.sequence,
      script: hexToU8Array(input.script),
      witness: input.witness?input.witness.map(w=>hexToU8Array(w)):undefined,
    })),
    outputs: tx.outputs.map(output=>({
      value: output.value,
      script: hexToU8Array(output.script),
    })),
    locktime: tx.locktime,
  }
}

function txToTxJSON(tx: ITransaction): ITransactionJSON {
  return {
    version: tx.version,
    inputs: tx.inputs.map(input=>({
      hash: u8ArrayToHex(input.hash),
      index: input.index,
      sequence: input.sequence,
      script: u8ArrayToHex(input.script),
      witness: input.witness?input.witness.map(w=>u8ArrayToHex(w)):undefined,
    })),
    outputs: tx.outputs.map(output=>({
      value: output.value,
      script: u8ArrayToHex(output.script),
    })),
    locktime: tx.locktime,
  }
}
export {
  normailzeTransactionOutput,
  txToTxJSON,
  txJSONToTx,
}