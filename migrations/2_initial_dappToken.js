const Token = artifacts.require("Token");
const TokenSale = artifacts.require("TokenSale");
const initialSupply = 1_000_000;
const { utils } = require("ethers");
const { parseEther } = utils;

const tokenPrice = parseEther("0.001"); // 0,001 in wei

module.exports = function (deployer) {
  deployer.deploy(Token, initialSupply).then(() => {
    return deployer.deploy(TokenSale, Token.address, tokenPrice);
  });
};
