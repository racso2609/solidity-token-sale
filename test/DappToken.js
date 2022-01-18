const DappToken = artifacts.require("./DappToken.sol");
const TOTAL_SUPPLY = 1000000;
contract("DappToken", function (accounts) {
  it("initialize the token with the correct value", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "DappToken");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "DAPP");
        return tokenInstance.standar();
      })
      .then((standar) => {
        assert.equal(standar, "DAPP token v1.0");
      });
  });
  it("sets total supply upon deployment", function () {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          TOTAL_SUPPLY,
          "set the total supply to " + TOTAL_SUPPLY
        );
        return tokenInstance.balance();
      })
      .then((adminBalance) => {
        assert.equal(adminBalance.toNumber(), 1000000, "initial admin account");
      });
  });

  it("transfer token", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 999999999999);
      })
      .then(assert.fail)
      .catch((err) => {
        assert(
          err.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((success) => {
        assert.equal(success, true, "transfer return true");
      })
      .then(() => {
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((recipient) => {
        assert.equal(recipient.logs.length, 1, "trigger one event");
        assert.equal(
          recipient.logs[0].event,
          "Transfer",
          "should be the transfer event"
        );
        assert.equal(
          recipient.logs[0].args.from,
          accounts[0],
          "from should be equal accounts[0]"
        );
        assert.equal(
          recipient.logs[0].args.to,
          accounts[1],
          "from should be equal accounts[1]"
        );
        assert.equal(
          recipient.logs[0].args.amount,
          250000,
          "amount should be 250000"
        );

        return tokenInstance.balanceOf(accounts[1]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          250000,
          "adds deposit to destination account"
        );
        return tokenInstance.balance();
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from send"
        );
      });
  });
});
