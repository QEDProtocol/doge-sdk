// TODO: add PSBT support and deprecate TransactionBuilder

import { getP2SHOutputScript } from "../address";
import { hashBuffer } from "../hash";
import { assembleBitcoinScript, disassembleScript } from "../script";
import { hexToU8Array, u8ArrayToHex } from "../utils/data";
import {
  ITransactionBuilderInput,
  INormalizedTransactionBuilderInput,
  IFinalizerInfo,
  IPartialSig,
} from "./builderTypes";
import { DEFAULT_SEQUENCE, SIGHASH_ALL } from "./constants";
import { Transaction } from "./transaction";
import { ITransactionOutput } from "./types";
function regularizeInput(
  input: ITransactionBuilderInput
): INormalizedTransactionBuilderInput {
  const sequence =
    typeof input.sequence === "number" ? input.sequence : DEFAULT_SEQUENCE;
  const hash =
    typeof input.hash === "string" ? hexToU8Array(input.hash) : input.hash;
  const lockScript = input.lockScript ? input.lockScript : (input.redeemScript?getP2SHOutputScript(hashBuffer("hash160", input.redeemScript)):undefined);
  if (lockScript) {
    return {
      ...input,
      sequence,
      hash,
      lockScript,
    };
  } else if (input.nonWitnessUtxo) {
    const lastTx = Transaction.fromBuffer(input.nonWitnessUtxo);
    const lastOutput = lastTx.outputs[input.index];
    if (!lastOutput) {
      throw new Error("Invalid input index");
    }
    return {
      ...input,
      sequence,
      hash,
      lockScript: lastOutput.script,
    };
  } else {
    throw new Error("nonWitnessUtxo or lockScript must be provided");
  }
}
async function defaultFinalizer(info: IFinalizerInfo): Promise<Uint8Array> {
  const assembly: string[] = info.signatures.map(
    (sig) => u8ArrayToHex(sig.signature) + " " + u8ArrayToHex(sig.pubkey)
  );
  info.unlockScript.forEach((x) => assembly.push(disassembleScript(x)));
  if(info.redeemScript) {
    // P2SH: push the redeem script to the stack so it can be hashed
    assembly.push(u8ArrayToHex(info.redeemScript));
  }
  
  return assembleBitcoinScript(
    assembly
      .map((x) => x.trim())
      .filter((x) => x.length)
      .join(" ")
  );
}

class TransactionBuilder {
  inputs: INormalizedTransactionBuilderInput[] = [];
  outputs: ITransactionOutput[] = [];

  constructor(
    inputs: ITransactionBuilderInput[] = [],
    outputs: ITransactionOutput[] = []
  ) {
    this.inputs = inputs.map(regularizeInput);
    this.outputs = outputs;
  }

  addInput(input: ITransactionBuilderInput) {
    this.inputs.push(regularizeInput(input));
  }

  addOutput(output: ITransactionOutput) {
    this.outputs.push(output);
  }

  toPartialTransaction() {
    return Transaction.fromPartial(
      this.inputs.map((x) => ({
        hash: x.hash,
        index: x.index,
        sequence: x.sequence,
      })),
      this.outputs
    );
  }
  getSigHash(inputIndex: number, sigHashType: number) {
    const tx = this.toPartialTransaction();
    return tx.getSigHash(
      inputIndex,
      this.inputs[inputIndex].redeemScript || this.inputs[inputIndex].lockScript,
      sigHashType
    );
  }
  getSigHashPreimage(inputIndex: number, sigHashType: number) {
    const tx = this.toPartialTransaction();
    return tx.getSigHashPreimage(
      inputIndex,
      this.inputs[inputIndex].redeemScript || this.inputs[inputIndex].lockScript,
      sigHashType
    );
  }
  async finalizeAndSign(): Promise<Transaction> {
    const result = this.toPartialTransaction();
    for (let i = 0; i < this.inputs.length; i++) {
      const inSigHashType = this.inputs[i].sigHashType;
      const sigHashType =
        typeof inSigHashType === "number" ? inSigHashType : SIGHASH_ALL;
      const sigHashPreimage = this.getSigHashPreimage(i, sigHashType);
      const sigHashTypeByteHex = sigHashType.toString(16).padStart(2, "0");
      const sigHash = hashBuffer("hash256", sigHashPreimage);
      const finalizer = this.inputs[i].finalizer || defaultFinalizer;
      const unlockScript = this.inputs[i].unlockScript || [];
      const newSignatures: IPartialSig[] = [];
      const signers = this.inputs[i].signers;

      if (Array.isArray(signers)) {
        for (const signer of signers) {
          const sig = await (signer.canSignHash()
            ? signer.signHash(u8ArrayToHex(sigHash))
            : signer.signTransaction(Transaction.fromBuffer(sigHashPreimage)));
          newSignatures.push({
            pubkey: hexToU8Array(sig.publicKey),
            signature: hexToU8Array(sig.signature + sigHashTypeByteHex),
          });
        }
      }

      const signatures = (this.inputs[i].signatures || []).concat(
        newSignatures
      );
      const info: IFinalizerInfo = {
        redeemScript: this.inputs[i].redeemScript,
        unlockScript,
        inputIndex: i,
        input: this.inputs[i],
        signatures: signatures,
        sigHashType,
        sigHashPreimage,
        sigHash,
      };
      result.inputs[i].script = await finalizer(info);
    }
    return result;
  }
}

export { TransactionBuilder };
