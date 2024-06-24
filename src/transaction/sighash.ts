import { Transaction } from './index';
import {
  SIGHASH_ANYONECANPAY,
  SIGHASH_NONE,
  SIGHASH_SINGLE,
} from './constants';
import { ISigHashPreimage } from './types';
import { hashBuffer } from '../hash';

function prepareSighashPreimagePreSegwit(
  transaction: Transaction,
  inputIndex: number,
  prevOutScript: Uint8Array,
  sighashType: number
): ISigHashPreimage<Transaction> {
  let ourScript = prevOutScript;

  let tx = transaction.shallowClone();
  if ((sighashType & 0x1f) === SIGHASH_NONE) {
    // ignore all outputs
    tx.outputs = [];
    tx.inputs[inputIndex].sequence = 0;
  } else if ((sighashType & 0x1f) === SIGHASH_SINGLE) {
    // ignore all outputs except the one at the same index
    tx.outputs = tx.outputs.slice(0, inputIndex + 1);
    for (let i = 0; i < inputIndex; i++) {
      tx.outputs[i] = { value: 0, script: new Uint8Array() };
      tx.inputs[i].sequence = 0;
    }
  }
  if ((sighashType & SIGHASH_ANYONECANPAY) !== 0) {
    tx.inputs = [tx.inputs[inputIndex]];
    tx.inputs[0].script = ourScript;
  } else {
    // SIGHASH_ALL
    for (const input of tx.inputs) {
      input.script = new Uint8Array();
    }
    tx.inputs[inputIndex].script = ourScript;
  }

  return {
    transaction: tx,
    sighashType,
  };
}

function getSigHashForTx(
  transaction: Transaction,
  inputIndex: number,
  prevOutScript: Uint8Array,
  sighashType: number
): Uint8Array {
  const preimage = prepareSighashPreimagePreSegwit(
    transaction,
    inputIndex,
    prevOutScript,
    sighashType
  );
  const data = preimage.transaction.toSighashBuffer(preimage.sighashType);
  return hashBuffer('hash256', data);
}

export { prepareSighashPreimagePreSegwit, getSigHashForTx };
