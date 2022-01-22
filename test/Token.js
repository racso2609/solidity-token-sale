const Token = artifacts.require("./Token.sol");
const TOTAL_SUPPLY = 1_000_000;
contract("Token", function (accounts) {
  it("initialize the token with the correct value", () => {
    return Token.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "RACToken");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "RAC");
      })
  });
  it("sets total supply upon deployment", function () {
    return Token.deployed()
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
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(adminBalance.toNumber(), 1000000, "initial admin account");
      });
  });

  it("transfer token", () => {
    return Token.deployed()
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
          recipient.logs[0].args.value,
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
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from send"
        );
      });
  });
  it("approves tokens from delegated transfer", () => {
    return Token.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.equal(success, true);
        return tokenInstance.approve(accounts[1], 100);
      })
      .then((recipient) => {
        assert.equal(recipient.logs.length, 1, "trigger one event");
        assert.equal(
          recipient.logs[0].event,
          "Approval",
          "should be the transfer event"
        );
        assert.equal(
          recipient.logs[0].args.owner,
          accounts[0],
          "owner should be equal accounts[0]"
        );
        assert.equal(
          recipient.logs[0].args.spender,
          accounts[1],
          "spender should be equal accounts[1]"
        );
        assert.equal(recipient.logs[0].args.value, 100, "amount should be 100");
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          100,
          "store the allowances for delegated transactions"
        );
      });
  });
  it("handle delegate transfer", () => {
    return Token.deployed()
      .then((instance) => {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then(() => {
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount,
        });
      })
      .then(() => {
        //transfer large than then sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
        //transfer large than then approve amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than approve amount"
        );

        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((success) => {
        assert.equal(success, true, 'transfer need return success');

        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((recipient) => {
        assert.equal(recipient.logs.length, 2, "trigger 2 events approval and transfer");
        assert.equal(
          recipient.logs[0].event,
          "Transfer",
          "should be the transfer event"
        );
        assert.equal(
          recipient.logs[0].args.from,
          fromAccount,
          "from should be equal fromAccount"
        );
        assert.equal(
          recipient.logs[0].args.to,
          toAccount,
          "from should be equal toAccount"
        );
        assert.equal(recipient.logs[0].args.value, 10, "amount should be 10");
        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 90, "deducts from transaction");
        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 10, "add from transaction");
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then((allowance) => {
        assert.equal(allowance.toNumber(), 0, "deducts from the allowance");
      });
  });
});
