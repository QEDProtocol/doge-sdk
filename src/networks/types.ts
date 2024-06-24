type DogeNetworkId = "doge" | "dogeTestnet" | "dogeRegtest";

interface Bip32 {
  public: number;
  private: number;
}

interface IDogeNetwork {
  messagePrefix: string;
  bech32: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  networkId: DogeNetworkId;
}
export type {
  IDogeNetwork,
  DogeNetworkId,
}