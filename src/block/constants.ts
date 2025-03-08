
/* Modifiers to the version.  */
const VERSION_AUXPOW = (1 << 8);

/** Bits above are reserved for the auxpow chain ID.  */
const VERSION_CHAIN_START = (1 << 16);

export {
    VERSION_AUXPOW,
    VERSION_CHAIN_START,
};