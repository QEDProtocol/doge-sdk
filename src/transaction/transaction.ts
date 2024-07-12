import { addressToOutputScript, isP2PKHOutputScript } from "../address";
import { hashBuffer } from "../hash";
import { IBaseUTXO } from "../rpc/types";
import { BytesBuilder } from "../utils/bytesBuilder";
import { BytesReader } from "../utils/bytesReader";
import { compareU8Array, hexToU8Array, u8ArrayToHex, u8ArrayToHexReversed } from "../utils/data";
import { varuintEncodingLength } from "../utils/varuint";
import { getSigHashForTx, prepareSighashPreimagePreSegwit } from "./sighash";
import {
  ITransaction,
  ITransactionInput,
  ITransactionInputWithoutScript,
  ITransactionOutput,
} from "./types";
const BIG_MAX_SAFE_INTEGER = BigInt("9007199254740991");
class Transaction implements ITransaction {
  version: number;
  inputs: ITransactionInput[];
  outputs: ITransactionOutput[];
  locktime: number;
  constructor(
    inputs: ITransactionInput[],
    outputs: ITransactionOutput[],
    locktime = 0,
    version = 1
  ) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.locktime = locktime;
  }
  static fromPartial(
    inputs: ITransactionInputWithoutScript[],
    outputs: ITransactionOutput[],
    locktime = 0,
    version = 2
  ) {
    const placeholderInputs = inputs.map((input) => ({
      ...input,
      script: new Uint8Array(),
    }));
    return new Transaction(placeholderInputs, outputs, locktime, version);
  }

  isDummyTransaction() {
    return this.inputs.length === 0 && this.outputs.length === 0;
  }

  getVoutsForAddress(address: string) {
    const script = addressToOutputScript(address);
    const vouts: number[] = [];
    this.outputs.forEach((output, index) => {
      if (compareU8Array(output.script, script)) {
        vouts.push(index);
      }
    });
    return vouts;
  }
  getUTXOsForAddress(address: string): IBaseUTXO[] {
    const vouts = this.getVoutsForAddress(address);
    if(vouts.length === 0) return [];
    
    const txid = u8ArrayToHexReversed(hashBuffer("hash256", this.toBuffer()));
    return vouts.map(vout => ({value: this.outputs[vout].value, vout, txid}));
  }

  hasWitnesses() {
    // dogecoin does not have witnesses
    return false;
  }

  byteLength(allowWitness = false) {
    const hasWitnesses = allowWitness && this.hasWitnesses();
    const base = hasWitnesses ? 10 : 8;
    // dogecoin does not have witnesses
    const witnessesSize = 0;

    const headerSize =
      base +
      varuintEncodingLength(this.inputs.length) +
      varuintEncodingLength(this.outputs.length);
    const inputsSize = this.inputs.reduce((acc, input) => {
      return acc + 40 + input.script.length;
    }, 0);
    const outputsSize = this.outputs.reduce((acc, output) => {
      return acc + 8 + output.script.length;
    }, 0);
    return headerSize + inputsSize + outputsSize + witnessesSize;
  }

  weight() {
    const base = this.byteLength(false);
    const total = this.byteLength(true);
    return base * 3 + total;
  }
  virtualSize() {
    return Math.ceil(this.weight() / 4);
  }
  private toBufferInternal(
    allowWitness = false,
    sigHashType: number | null
  ): Uint8Array {
    const isSigHash = typeof sigHashType === "number";
    const builder = new BytesBuilder(
      this.byteLength(allowWitness) + (isSigHash ? 4 : 0)
    );
    builder.writeUint32(this.version);
    builder.writeVaruint(this.inputs.length);
    this.inputs.forEach((input) => {
      builder.writeBytes(input.hash);
      builder.writeUint32(input.index);
      builder.writeVarSlice(input.script);
      builder.writeUint32(input.sequence);
    });
    builder.writeVaruint(this.outputs.length);
    this.outputs.forEach((output) => {
      builder.writeUint64(output.value);
      builder.writeVarSlice(output.script);
    });
    builder.writeUint32(this.locktime);
    if (isSigHash&&typeof sigHashType === "number") {
      builder.writeUint32(sigHashType);
    }
    return builder.toBuffer();
  }
  toBuffer(allowWitness = false) {
    return this.toBufferInternal(allowWitness, null);
  }
  toHex(){
    return u8ArrayToHex(this.toBuffer());
  }
  toSighashBuffer(sigHashType: number) {
    return this.toBufferInternal(false, sigHashType);
  }
  getSigHash(
    inputIndex: number,
    prevOutScript: Uint8Array,
    sighashType: number
  ) {
    return getSigHashForTx(this, inputIndex, prevOutScript, sighashType);
  }
  getSigHashPreimage(
    inputIndex: number,
    prevOutScript: Uint8Array,
    sighashType: number
  ) {
    const preimage = prepareSighashPreimagePreSegwit(
      this,
      inputIndex,
      prevOutScript,
      sighashType
    ); 

    return preimage.transaction.toSighashBuffer(preimage.sighashType);
  }
  addInput(input: ITransactionInput) {
    this.inputs.push(input);
    return this;
  }
  addOutput(output: ITransactionOutput) {
    this.outputs.push(output);
    return this;
  }
  shallowClone(): Transaction {
    return new Transaction(
      this.inputs.map((input) => ({ ...input })),
      this.outputs.map((output) => ({ ...output })),
      this.locktime,
      this.version
    );
  }
  static fromBuffer(buffer: Uint8Array): Transaction {
    return Transaction.fromBytesReader(new BytesReader(buffer));
  }
  static fromHex(hex: string): Transaction {
    return Transaction.fromBuffer(hexToU8Array(hex));
  }
  static fromBytesReader(reader: BytesReader): Transaction {
    const version = reader.readUint32();
    const inputs: ITransactionInput[] = [];
    const inputsLength = reader.readVaruint();
    for (let i = 0; i < inputsLength; i++) {
      const hash = reader.readBytes(32);
      const index = reader.readUint32();
      const script = reader.readVarSlice();
      const sequence = reader.readUint32();
      inputs.push({ hash, index, script, sequence });
    }
    const outputs: ITransactionOutput[] = [];
    const outputsLength = reader.readVaruint();
    for (let i = 0; i < outputsLength; i++) {
      const value = reader.readUint64();
      if (value > BIG_MAX_SAFE_INTEGER) {
        throw new Error("Value is too large");
      }
      const numValue = Number(value.toString());
      const script = reader.readVarSlice();
      outputs.push({ value: numValue, script });
    }
    const locktime = reader.readUint32();
    return new Transaction(inputs, outputs, locktime, version);
  }
  getSighashInputIndex(){
    const nonEmptyIndexes = this.inputs
      .map((input, index) => ({input, index}))
      .filter(({input}) => input.script.length !== 0);
    return nonEmptyIndexes.length !== 1 ? -1 : nonEmptyIndexes[0].index;
  }
  getSigHashConfig(): {isP2PKH: boolean, inputIndex: number} {
    const index = this.getSighashInputIndex();
    if(index === -1) return {isP2PKH: false, inputIndex: -1};
    return {isP2PKH: isP2PKHOutputScript(this.inputs[index].script), inputIndex: index};
  }
  static fromBase(base: ITransaction) {
    return new Transaction(
      base.inputs.map((input) => ({ ...input })),
      base.outputs.map((output) => ({ ...output })),
      base.locktime,
      base.version
    );
  }
}
export { Transaction };
