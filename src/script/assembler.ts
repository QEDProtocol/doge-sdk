import { BytesBuilder } from "../utils/bytesBuilder";
import { hexToU8Array, isHexString } from "../utils/data";
import { OP_CODES, getOpCodeFromString } from "./opcodes";
import { pushDataHeaderLength, writePushData } from "./pushData";

interface IToken {
  opCode: number;
  data?: Uint8Array;
}
function getTokenSize(token: IToken): number {
  if(token.opCode === UNRESOLVED_DATA_OP_CODE){
    if(!token.data){
      throw new Error("Data is not resolved");
    }
    return pushDataHeaderLength(token.data.length) + token.data.length;
  }else{
    return 1;
  }
}

const UNRESOLVED_DATA_OP_CODE = 0x1ff;

function parseScript(str: string){
  const tokens: IToken[] = [];
  const parts = str.split(' ').map(x=>x.trim()).filter(x=>x.length);
  for (const part of parts) {
    if(part.startsWith("OP_")){
      const opCode = getOpCodeFromString(part);
      if(opCode === -1 || opCode === OP_CODES.OP_PUSHDATA1 || opCode === OP_CODES.OP_PUSHDATA2 || opCode === OP_CODES.OP_PUSHDATA4){
        throw new Error(`Invalid opcode: ${part}`);
      }else{
        tokens.push({opCode});
      }
    }else if(isHexString(part)){
      const data = hexToU8Array(part);
      tokens.push({opCode: UNRESOLVED_DATA_OP_CODE, data});
    }else{
      throw new Error(`Invalid instruction: ${part}`);
    }
  }
  return tokens;
}

function getScriptSize(tokens: IToken[]): number {
  return tokens.reduce((acc, x) => acc + getTokenSize(x), 0);
}

function assembleTokens(tokens: IToken[]): Uint8Array {
  const builder = new BytesBuilder(getScriptSize(tokens));
  for(const token of tokens){
    if(token.opCode !== UNRESOLVED_DATA_OP_CODE){
      builder.writeByte(token.opCode);
    }else{
      if(!token.data){
        throw new Error("Data is not resolved");
      }
      writePushData(builder, token.data);
    }
  }
  return builder.toBuffer();
}

function assembleBitcoinScript(str: string): Uint8Array {
  return assembleTokens(parseScript(str));
}



export {
  assembleBitcoinScript,
}