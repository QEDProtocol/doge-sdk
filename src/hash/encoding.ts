import { hexToU8Array, u8ArrayToHex } from "../utils/data";
import { ValidHashEncodings } from "./types";

function decodeData(
  data: Uint8Array | string,
  encoding?: ValidHashEncodings
): Uint8Array {
  if (typeof data === "string") {
    if (encoding === "hex") {
      return hexToU8Array(data);
    } else if (
      encoding === "utf-8" ||
      encoding === "utf8" ||
      typeof encoding == "undefined"
    ) {
      return new TextEncoder().encode(data);
    } else {
      throw new Error("Invalid encoding '" + encoding + "'");
    }
  } else if (data instanceof Uint8Array) {
    if (typeof encoding == "undefined" || encoding == "binary") {
      return data;
    } else {
      throw new Error("Invalid encoding '" + encoding + "'");
    }
  } else {
    throw new Error(
      "Invalid data passed to decodeData, should be string or Uint8Array"
    );
  }
}

function encodeData(
  data: Uint8Array,
  encoding?: ValidHashEncodings
): Uint8Array | string {
  if (encoding === "hex") {
    return u8ArrayToHex(data);
  } else if (encoding === "utf-8" || encoding === "utf8") {
    return new TextDecoder().decode(data);
  } else if (encoding === "binary" || typeof encoding == "undefined") {
    return data;
  } else {
    throw new Error("Invalid encoding '" + encoding + "'");
  }
}

export { decodeData, encodeData };
