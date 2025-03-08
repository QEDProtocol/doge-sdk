import { getDogeNetworkById } from "../networks";
import { DogeNetworkId, IDogeNetwork } from "../networks/types";
import { BlockHeader } from "./header";
import { getBitsForTarget, getTargetForBits } from "./utils";

function calculateDogecoinNextWorkRequired(lastHeight: number, lastBlockTime: number, lastBits: number, nFirstBlockTime: number, params: IDogeNetwork): number {
    const nHeight = lastHeight + 1;
    const retargetTimespan = params.nPowTargetTimespan;
    const nActualTimespan = lastBlockTime - nFirstBlockTime;
    let nModulatedTimespan = nActualTimespan;
    let nMaxTimespan = 0;
    let nMinTimespan = 0;
    const fDigishieldDifficultyCalculation = params.networkId === "dogeRegtest" ? true : lastHeight >= 145000;


    if (fDigishieldDifficultyCalculation) //DigiShield implementation - thanks to RealSolid & WDC for this code
    {
        // amplitude filter - thanks to daft27 for this code
        nModulatedTimespan = retargetTimespan + (nModulatedTimespan - retargetTimespan) / 8;

        nMinTimespan = retargetTimespan - (retargetTimespan / 4);
        nMaxTimespan = retargetTimespan + (retargetTimespan / 2);
    } else if (nHeight > 10000) {
        nMinTimespan = retargetTimespan / 4;
        nMaxTimespan = retargetTimespan * 4;
    } else if (nHeight > 5000) {
        nMinTimespan = retargetTimespan / 8;
        nMaxTimespan = retargetTimespan * 4;
    } else {
        nMinTimespan = retargetTimespan / 16;
        nMaxTimespan = retargetTimespan * 4;
    }

    // Limit adjustment step
    if (nModulatedTimespan < nMinTimespan)
        nModulatedTimespan = nMinTimespan;
    else if (nModulatedTimespan > nMaxTimespan)
        nModulatedTimespan = nMaxTimespan;

    // Retarget
    const bnPowLimit = BigInt(params.powLimit);
    let bnNew = getTargetForBits(lastBits);
    //const bnOld = bnNew;
    bnNew *= BigInt(nModulatedTimespan);
    bnNew /= BigInt(retargetTimespan);

    if (bnNew > bnPowLimit)
        bnNew = bnPowLimit;

    return getBitsForTarget(bnNew);
}
async function getNextWorkRequired(lastHeight: number, lastBlockTime: number, lastBits: number, blockHeader: BlockHeader, params: IDogeNetwork, getBlockHeader: (index: number) => Promise<BlockHeader>): Promise<number> {
    const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));


    const curBlockTime = blockHeader.timestamp;
    // Genesis block
    if (lastHeight === -1)
        return nProofOfWorkLimit;

    // Dogecoin: Special rules for minimum difficulty blocks with Digishield
    if (params.fPowAllowMinDifficultyBlocks && lastHeight >= 157500 && blockHeader.timestamp > lastBlockTime + params.nPowTargetSpacing * 2) {
        // Special difficulty rule for testnet:
        // If the new block's timestamp is more than 2* nTargetSpacing minutes
        // then allow mining of a min-difficulty block.
        return nProofOfWorkLimit;
    }


    const fNewDifficultyProtocol = (lastHeight >= 145000);
    const difficultyAdjustmentInterval = fNewDifficultyProtocol
        ? 1
        : Math.floor(params.nPowTargetTimespan / params.nPowTargetSpacing)
    if ((lastHeight + 1) % difficultyAdjustmentInterval != 0) {
        if (params.fPowAllowMinDifficultyBlocks) {
            // Special difficulty rule for testnet:
            // If the new block's timestamp is more than 2* 10 minutes
            // then allow mining of a min-difficulty block.
            if (curBlockTime > lastBlockTime + params.nPowTargetSpacing * 2)
                return nProofOfWorkLimit;
            else {
                // Return the last non-special-min-difficulty-rules-block
                let nHeight = lastHeight;
                let nBits = lastBits;

                const difficultyAdjustmentInterval = Math.floor(params.nPowTargetTimespan / params.nPowTargetSpacing);
                while (nHeight % difficultyAdjustmentInterval != 0 && nBits == nProofOfWorkLimit) {
                    nHeight -= 1;
                    const bh = await getBlockHeader(nHeight);
                    nBits = bh.bits;
                }
                return nBits;
            }
        }
        return lastBits;
    }

    // Litecoin: This fixes an issue where a 51% attack can change difficulty at will.
    // Go back the full period unless it's the first retarget after genesis. Code courtesy of Art Forz
    let blockstogoback = difficultyAdjustmentInterval - 1;
    if ((lastHeight + 1) != difficultyAdjustmentInterval)
        blockstogoback = difficultyAdjustmentInterval;

    // Go back by what we want to be 14 days worth of blocks
    const nHeightFirst = lastHeight - blockstogoback;

    const firstHeader = await getBlockHeader(nHeightFirst);
    const nFirstBlockTime = firstHeader.timestamp;


    return calculateDogecoinNextWorkRequired(lastHeight, lastBlockTime, lastBits, nFirstBlockTime, params);

}

function getNextWorkRequiredMainnetModern(lastHeight: number, lastBlockTime: number, lastBits: number, prevPrevBlockTime: number): number {
    const params = getDogeNetworkById("doge");
    //const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));
    //const curBlockTime = blockHeader.timestamp;
    if (lastHeight < 371337) {
        throw new Error("unsupported legacy block");
    }
    return calculateDogecoinNextWorkRequired(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime, params);


}


function getNextWorkRequiredTestnetModern(lastHeight: number, lastBlockTime: number, lastBits: number, prevPrevBlockTime: number, curBlockTime: number): number {
    const params = getDogeNetworkById("doge");
    //const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));
    //const curBlockTime = blockHeader.timestamp;
    if (lastHeight < 158100) {
        throw new Error("unsupported legacy block");
    }
    const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));


    // Genesis block
    if (lastHeight === -1)
        return nProofOfWorkLimit;

    // Dogecoin: Special rules for minimum difficulty blocks with Digishield
    if (params.fPowAllowMinDifficultyBlocks && lastHeight >= 157500 && curBlockTime > lastBlockTime + params.nPowTargetSpacing * 2) {
        // Special difficulty rule for testnet:
        // If the new block's timestamp is more than 2* nTargetSpacing minutes
        // then allow mining of a min-difficulty block.
        return nProofOfWorkLimit;
    }

    return calculateDogecoinNextWorkRequired(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime, params);


}

function getNextWorkRequiredRegtestModern(lastHeight: number, lastBlockTime: number, lastBits: number, prevPrevBlockTime: number, curBlockTime: number): number {
    const params = getDogeNetworkById("doge");
    //const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));
    //const curBlockTime = blockHeader.timestamp;
    if (lastHeight < 20) {
        throw new Error("unsupported legacy block");
    }
    const nProofOfWorkLimit = getBitsForTarget(BigInt(params.powLimit));


    // Genesis block
    if (lastHeight === -1)
        return nProofOfWorkLimit;

    // Dogecoin: Special rules for minimum difficulty blocks with Digishield
    if (params.fPowAllowMinDifficultyBlocks && lastHeight >= 157500 && curBlockTime > lastBlockTime + params.nPowTargetSpacing * 2) {
        // Special difficulty rule for testnet:
        // If the new block's timestamp is more than 2* nTargetSpacing minutes
        // then allow mining of a min-difficulty block.
        return nProofOfWorkLimit;
    }

    return calculateDogecoinNextWorkRequired(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime, params);


}
function getNextWorkRequiredModern(lastHeight: number, lastBlockTime: number, lastBits: number, prevPrevBlockTime: number, curBlockTime: number, networkId: DogeNetworkId): number {
    if(networkId === "doge"){
        return getNextWorkRequiredMainnetModern(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime);
    }else if(networkId === "dogeTestnet"){
        return getNextWorkRequiredTestnetModern(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime, curBlockTime);
    }else{
        return getNextWorkRequiredRegtestModern(lastHeight, lastBlockTime, lastBits, prevPrevBlockTime, curBlockTime);
    }
}

export {
    getNextWorkRequiredModern,
    getNextWorkRequired,
}