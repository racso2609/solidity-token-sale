const Token = artifacts.require("Token");
const TokenSale = artifacts.require("TokenSale");
const initialSupply = 1_000_000;
const tokenPrice = 1_000_000_000_000_000; //0,001 in wei


module.exports = function (deployer) {
  deployer.deploy(Token, initialSupply).then(() => {
    return deployer.deploy(TokenSale, Token.address, tokenPrice);
  });
};
