const DappToken = artifacts.require("DappToken");
const initialSupply = 1_000_000;

module.exports = function (deployer) {
  deployer.deploy(DappToken, initialSupply);
};
