import { encodeP2SHAddress, getP2SHOutputScript } from "../../address";
import { hashBuffer } from "../../hash";
import { DogeNetworkId } from "../../networks/types";
import { compileBasmLiteScriptBuffer } from "../../script";
import { TransactionBuilder } from "../../transaction/builder";
import { normailzeTransactionOutput } from "../../transaction/normalize";
import { ITransactionOutputUser } from "../../transaction/types";
import { hexToU8ArrayReversed } from "../../utils/data";
import { ICreateP2SHParams, IP2SHFundingUTXO } from "./types";

function createP2SHTransactionInternal(
  unlockScript: Uint8Array[] | Uint8Array,
  redeemScript: Uint8Array,
  scriptHash: Uint8Array,
  inputs: IP2SHFundingUTXO[],
  outputs: ITransactionOutputUser[],
): TransactionBuilder {
  const transaction = new TransactionBuilder();
  inputs.forEach((input) => {
    transaction.addInput({
      hash: hexToU8ArrayReversed(input.txid),
      index: input.vout,
      lockScript: getP2SHOutputScript(scriptHash),
      redeemScript,
      sequence: input.sequence,
      value: input.value,
      signers: input.signers??[],
      unlockScript:
        typeof unlockScript[0] === "number"
          ? [unlockScript as Uint8Array]
          : (unlockScript as Uint8Array[]),
    });
  });
  outputs.forEach((output) => {
    transaction.addOutput(normailzeTransactionOutput(output));
  });
  return transaction;
}

function createP2SHTransaction(
  params: ICreateP2SHParams
){
  const baseSigners = params.signers || [];
  const inputs = params.inputs.map(x=>({...x, signers: x.signers? x.signers.concat(baseSigners): baseSigners}));
  if(!params.redeemScript && !params.redeemScriptBASM){
    throw new Error('Must provide redeemScript or redeemScriptBASM');
  }
  const redeemScript = params.redeemScript ?? compileBasmLiteScriptBuffer(params.redeemScriptBASM||"");
  const unlockScript = params.unlockScript ?? compileBasmLiteScriptBuffer(params.unlockScriptBASM||"");
  const scriptHash = hashBuffer("hash160", redeemScript);
  return createP2SHTransactionInternal(unlockScript, redeemScript, scriptHash, inputs, params.outputs);
}
function getP2SHAddress(redeemScriptOrBASM: Uint8Array | string, networkId: DogeNetworkId): string {
  const redeemScript = typeof redeemScriptOrBASM === 'string' ? compileBasmLiteScriptBuffer(redeemScriptOrBASM) : redeemScriptOrBASM;
  return encodeP2SHAddress(networkId, hashBuffer("hash160", redeemScript))
}

export {
  createP2SHTransaction,
  getP2SHAddress,
}