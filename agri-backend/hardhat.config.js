/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/GLb0GHuQG_WKHrY1oq9dMCm_bvyQyNNM",
      accounts: [`0426b7df5aa08743a272d278ef0e5c7051dcd4b7a15339db75c0b883f9240972`], // Use an account with Sepolia ETH
    },
  },
  etherscan: {
    apiKey: "A9XZBFZDUAHZI4E74HD8YCYJIV3J3FKR5U", 
  },
};



