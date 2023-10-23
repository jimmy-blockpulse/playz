require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "polygonMumbai",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  networks: {
    hardhat: {},
    goerliOptimism: {
      url: "https://goerli.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 420,
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerliOptimism: process.env.OPTIMISM_ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "goerliOptimism",
        chainId: 420,
        urls: {
          apiURL: "https://api-goerli-optimism.etherscan.io/api",
          browserURL: "https://goerli-optimism.etherscan.io",
        },
      },
    ],
  },
};
