import { addressToOutputScript } from "../address";
import { ITransactionOutput, ITransactionOutputAddress, ITransactionOutputUser } from "./types";

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

export {
  normailzeTransactionOutput,
}