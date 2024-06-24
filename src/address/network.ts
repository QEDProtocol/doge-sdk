import { dogeNetworks } from '../networks';
import { DogeNetworkId } from '../networks/types';

const NETWORK_IDS = [dogeNetworks.doge.networkId, dogeNetworks.dogeTestnet.networkId, dogeNetworks.dogeRegtest.networkId];
const PUB_KEY_HASH_VERSIONS = [dogeNetworks.doge.pubKeyHash, dogeNetworks.dogeTestnet.pubKeyHash, dogeNetworks.dogeRegtest.pubKeyHash];
const SCRIPT_HASH_VERSIONS = [dogeNetworks.doge.scriptHash, dogeNetworks.dogeTestnet.scriptHash, dogeNetworks.dogeRegtest.scriptHash];
const PRIVATE_KEY_WIF_VERSIONS = [dogeNetworks.doge.wif, dogeNetworks.dogeTestnet.wif, dogeNetworks.dogeRegtest.wif];

function getNetworkIdFromP2PKHVersion(version: number): DogeNetworkId {
  const index = PUB_KEY_HASH_VERSIONS.indexOf(version);
  if(index === -1){
    throw new Error("Unknown P2PKH version: 0x"+version.toString(16));
  }
  return NETWORK_IDS[index];
}

function getNetworkIdFromP2SHVersion(version: number): DogeNetworkId {
  const index = SCRIPT_HASH_VERSIONS.indexOf(version);
  if(index === -1){
    throw new Error("Unknown P2SH version: 0x"+version.toString(16));
  }
  return NETWORK_IDS[index];
}

function getNetworkIdFromAddressVersion(version: number): DogeNetworkId {
  if(isAddressVersionP2PKH(version)){
    return getNetworkIdFromP2PKHVersion(version);
  }
  if(isAddressVersionP2SH(version)){
    return getNetworkIdFromP2SHVersion(version);
  }
  throw new Error("Unknown Address version: 0x"+version.toString(16));
}

function getNetworkIdFromPrivateKeyVersion(version: number): DogeNetworkId {
  const index = PRIVATE_KEY_WIF_VERSIONS.indexOf(version);
  if(index === -1){
    throw new Error("Unknown Private Key version: 0x"+version.toString(16));
  }
  return NETWORK_IDS[index];
}

function isAddressVersionP2PKH(version: number){
  return PUB_KEY_HASH_VERSIONS.indexOf(version) !== -1;
}
function isAddressVersionP2SH(version: number){
  return SCRIPT_HASH_VERSIONS.indexOf(version) !== -1;
}

export {
  getNetworkIdFromP2PKHVersion,
  getNetworkIdFromP2SHVersion,
  getNetworkIdFromPrivateKeyVersion,
  isAddressVersionP2PKH,
  isAddressVersionP2SH,
  getNetworkIdFromAddressVersion,

}