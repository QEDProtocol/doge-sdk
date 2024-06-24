module.exports = {
  verbose: true,
  globals: {
    "ts-jest": {
      babelConfig: true,
    },
  },
  transform: {
    "/node_modules/@noble/(secp256k1)?/(.+).js": "ts-jest",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@noble)/",
  ],
  preset: "ts-jest",
  roots: ['<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}
