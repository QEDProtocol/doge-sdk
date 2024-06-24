import { DogeNetworkId, IDogeNetwork } from "./types";

const doge: IDogeNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dge', // doge doesn't have bech32
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
  networkId: "doge",
};
const dogeRegtest: IDogeNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dgr', // doge doesn't have bech32
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  networkId: "dogeRegtest",
};
const dogeTestnet: IDogeNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dgt', // doge doesn't have bech32
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x71,
  scriptHash: 0xc4,
  wif: 0xf1,
  networkId: "dogeTestnet",
};

const dogeNetworks = {
  doge,
  dogeTestnet,
  dogeRegtest,
};

function getDogeNetworkById(id: DogeNetworkId): IDogeNetwork {
  if (id === "doge") return doge;
  if (id === "dogeTestnet") return dogeTestnet;
  if (id === "dogeRegtest") return dogeRegtest;
  throw new Error(`Invalid DogeNetworkId: ${id}`);
}

export {
  getDogeNetworkById,
  dogeNetworks,
}