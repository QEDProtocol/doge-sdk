import { getP2PKHAddressFromPublicKey, isP2SHAddress } from '../address';
import { coinSelectP2PKH, getStandardP2PKHTxSize } from '../coinselect';
import { createP2PKHTransaction } from '../helpers';
import { ICreateP2PKHParams } from '../helpers/p2pkh/types';
import { IDogeLinkElectrsRPC } from '../rpc/electrsTypes';
import { IDogeLinkRPC, IUTXO } from '../rpc/types';
import { Transaction } from '../transaction';
import { hexToU8Array } from '../utils/data';
import { waitMs } from '../utils/misc';
import { IDogeTransactionSigner } from '../wallet/types';

enum SingletStatusUpdateEventType {
  SignSelfTransfer = 0,
  WaitForSelfTransferTx = 1,
  SignFinalTransaction = 2,
}
interface ISingletStatusUpdateEventBase {
  type: SingletStatusUpdateEventType;
  txid?: string;
}
interface ISingletStatusUpdateSign
  extends ISingletStatusUpdateEventBase,
    ICreateP2PKHParams {
  type:
    | SingletStatusUpdateEventType.SignSelfTransfer
    | SingletStatusUpdateEventType.SignFinalTransaction;
  fee: number;
}

interface ISingletStatusUpdateWaitForTx extends ISingletStatusUpdateEventBase {
  type: SingletStatusUpdateEventType.WaitForSelfTransferTx;
  txid: string;
}

type ISingletStatusUpdateEvent =
  | ISingletStatusUpdateSign
  | ISingletStatusUpdateWaitForTx;
interface ITransferSingletOptionsBase {
  signer: IDogeTransactionSigner;
  amount: number;
  feeRate: number;
  destination: string;
  rpc: IDogeLinkRPC;
  onStatusUpdate?: (event: ISingletStatusUpdateEvent) => Promise<any> | any;
  mineBlocksAfterSelfTransfer?: number;
  utxos?: IUTXO[];
  dustThreshold?: number;
}
interface ITransferSingletOptionsElectrs extends ITransferSingletOptionsBase {
  rpc: IDogeLinkElectrsRPC;
}
interface ITransferSingletOptionsUTXOs extends ITransferSingletOptionsBase {
  utxos: IUTXO[];
}
type ITransferSingletOptions =
  | ITransferSingletOptionsElectrs
  | ITransferSingletOptionsUTXOs;

async function generateSingletTransaction({
  signer,
  amount,
  feeRate,
  destination,
  rpc,
  onStatusUpdate,
  mineBlocksAfterSelfTransfer,
  utxos,
  dustThreshold,
}: ITransferSingletOptions): Promise<ICreateP2PKHParams & {fee: number}> {
  const walletPublicKey = await signer.getCompressedPublicKey();
  const networkId = rpc.getNetwork().networkId;
  const walletAddress = getP2PKHAddressFromPublicKey(
    hexToU8Array(walletPublicKey),
    networkId
  );

  const realOnStatusUpdate = onStatusUpdate || (() => true);

  dustThreshold = typeof dustThreshold === 'number' ? dustThreshold : 1000000;

  const realUtxos = Array.isArray(utxos)
    ? utxos
    : await (rpc as IDogeLinkElectrsRPC).getUTXOs(walletAddress);

  const isP2SH = isP2SHAddress(destination);
  const tx2Size = getStandardP2PKHTxSize(1, isP2SH ? 0 : 1, isP2SH ? 1 : 0);
  const tx2Cost = Math.ceil(tx2Size * feeRate);
  const totalCost2 = amount + tx2Cost;

  const cheapestSingle = realUtxos
    .filter((x) => x.value > totalCost2)
    .sort((a, b) => a.value - b.value)[0];
  if (cheapestSingle && cheapestSingle.value - totalCost2 < dustThreshold) {
    const createP2PKHParams: ICreateP2PKHParams = {
      address: walletAddress,
      inputs: [cheapestSingle],
      outputs: [{ address: destination, value: amount }],
    };
    const fee = cheapestSingle.value - totalCost2;
    return {
      ...createP2PKHParams,
      fee,
    }
  }

  const result = coinSelectP2PKH(walletAddress, feeRate, realUtxos, [
    { address: walletAddress, value: totalCost2 },
  ]);
  await realOnStatusUpdate({
    type: SingletStatusUpdateEventType.SignSelfTransfer,
    ...result
  });
  const tx1 = createP2PKHTransaction(signer, result);
  const finalizedTx1 = await tx1.finalizeAndSign();
  const tx1id = await rpc.sendRawTransaction(finalizedTx1.toHex());

  await realOnStatusUpdate({
    type: SingletStatusUpdateEventType.WaitForSelfTransferTx,
    txid: tx1id,
  });
  if(mineBlocksAfterSelfTransfer){
    await rpc.mineBlocks(mineBlocksAfterSelfTransfer);
    await waitMs(3000);
  }
  await rpc.waitForTransaction(tx1id, true);

  let ind = -1;
  for (let i = 0; i < finalizedTx1.outputs.length; i++) {
    if (finalizedTx1.outputs[i].value === totalCost2) {
      ind = i;
      break;
    }
  }

  return {
    fee: tx2Cost,
    address: walletAddress,
    inputs: [
      {
        value: totalCost2,
        txid: tx1id,
        vout: ind,
      },
    ],
    outputs: [
      {
        address: destination,
        value: amount,
      },
    ],
  };
}



async function createSingletTransaction(options: ITransferSingletOptions): Promise<Transaction> {
  const finalCreateTx = await generateSingletTransaction(options);

  const {rpc, signer, onStatusUpdate} = options;

  const realOnStatusUpdate = onStatusUpdate || (() => true);
  await realOnStatusUpdate({
    type: SingletStatusUpdateEventType.SignFinalTransaction,
    ...finalCreateTx,
  });
  const finalizedFinalTx = await createP2PKHTransaction(signer, finalCreateTx).finalizeAndSign();
  return finalizedFinalTx;
}

async function sendSingletTransaction(options: ITransferSingletOptions): Promise<string>{
  const tx = await createSingletTransaction(options);
  return options.rpc.sendRawTransaction(tx.toHex());
}


export {
  createSingletTransaction,
  sendSingletTransaction,
}
