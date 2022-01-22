const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");
const initialSupply = 1_000_000;
const tokenPrice = 1_000_000_000_000_000; //0,001 in wei


module.exports = function (deployer) {
  deployer.deploy(DappToken, initialSupply).then(() => {
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
