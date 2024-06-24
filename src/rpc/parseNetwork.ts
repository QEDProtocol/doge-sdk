import { IDogeLinkRPCInfo } from "./types";

function parseDogeLinkNetworkURI(uri: string): IDogeLinkRPCInfo {
  const url = new URL(uri);
  const base = url.origin+(url.pathname+"/").replace(/\/+/g, "/");

  return {
    url: base,
    fullUrl: (url+"").split("?")[0],
    network: (url.searchParams.get('network') as any) || 'doge',
    user: url.username,
    password: url.password,
  }
}

export {
  parseDogeLinkNetworkURI,
}