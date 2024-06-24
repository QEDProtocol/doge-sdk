import { BytesBuilder } from "../utils/bytesBuilder";
import { OP_CODES } from "./opcodes";

function pushDataHeaderLength(pushDataLength: number): number {
  if(pushDataLength < OP_CODES.OP_PUSHDATA1){
    return 1;
  }else if(pushDataLength < 0x100){
    return 2;
  }else if(pushDataLength < 0x10000){
    return 3;
  }else{
    return 5;
  }
}

function writePushDataHeader(builder: BytesBuilder, length: number) {
  if(length < OP_CODES.OP_PUSHDATA1){
    builder.writeByte(length);
  }else if(length < 0x100){
    builder.writeByte(OP_CODES.OP_PUSHDATA1);
    builder.writeByte(length);
  }else if(length < 0x10000){
    builder.writeByte(OP_CODES.OP_PUSHDATA2);
    builder.writeUint16(length, true);
  }else{
    builder.writeByte(OP_CODES.OP_PUSHDATA4);
    builder.writeUint32(length, true);
  }
}

function writePushData(builder: BytesBuilder, data: Uint8Array) {
  writePushDataHeader(builder, data.length);
  builder.writeBytes(data);
}

export {
  pushDataHeaderLength,
  writePushData,
}