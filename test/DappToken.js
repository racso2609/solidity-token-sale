const DappToken = artifacts.require("./DappToken.sol");
const TOTAL_SUPPLY = 1000000;
contract("DappToken", function (accounts) {
  it("sets total supply upon deployment", function () {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), TOTAL_SUPPLY);
      });
  });
});
