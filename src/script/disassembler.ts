import { BytesReader } from "../utils/bytesReader";
import { u8ArrayToHex } from "../utils/data";
import { OP_CODES, getOpCodeStringFromByte } from "./opcodes";

function disassembleScript(script: Uint8Array): string {
  if(script.length === 0){
    return "";
  }
  const reader = new BytesReader(script);
  const output: string[] = [];
  while(reader.offset < script.length){
    const opCode = reader.readByte();
    if(opCode === OP_CODES.OP_0){
      output.push("OP_0");
    }else if(opCode < OP_CODES.OP_PUSHDATA1){
      output.push(u8ArrayToHex(reader.readBytes(opCode)));
    }else if(opCode === OP_CODES.OP_PUSHDATA1){
      output.push(u8ArrayToHex(reader.readBytes(reader.readByte())));
    }else if(opCode === OP_CODES.OP_PUSHDATA2){
      output.push(u8ArrayToHex(reader.readBytes(reader.readUint16())));
    }else if(opCode === OP_CODES.OP_PUSHDATA4){
      output.push(u8ArrayToHex(reader.readBytes(reader.readUint32())));
    }else{
      const opCodeName = getOpCodeStringFromByte(opCode);
      if(opCodeName === "OP_INVALIDOPCODE"){
        throw new Error(`Invalid opcode: ${opCode}`);
      }else{
        output.push(getOpCodeStringFromByte(opCode));
      }
    }
  }
  return output.join(" ");
}

export {
  disassembleScript,
}