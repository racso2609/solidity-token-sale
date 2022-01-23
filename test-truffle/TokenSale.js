const TokenSale = artifacts.require("TokenSale");
const Token = artifacts.require("Token");

contract("TokenSale", (accounts) => {
  let tokenSaleInstance;
  let tokenInstance;
  let numberOfTokens;
  const admin = accounts[0];
  const tokensAvaliable = 750_000;
  const tokenPrice = 1_000_000_000_000_000; // 0,001 in wei
  const buyer = accounts[1];

  it("initialize contract", () => {
    return TokenSale.deployed()
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "price correct");
      });
  });
  it("facilitates toke buying", () => {
    return Token.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return TokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        //Provision 75% of all tokens to the token sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvaliable,
          { from: admin }
        );
      })
      .then(() => {
        numberOfTokens = 10;
        const value = numberOfTokens * tokenPrice;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value,
        });
      })
      .then((recipient) => {
        assert.equal(recipient.logs.length, 1, "trigger one event");
        assert.equal(
          recipient.logs[0].event,
          "Sell",
          "should be the sell event"
        );
        assert.equal(
          recipient.logs[0].args.buyer,
          buyer,
          "from should be equal accounts[0]"
        );
        assert.equal(
          recipient.logs[0].args.numberOfTokens,
          numberOfTokens,
          "amount should be 250000"
        );

        return tokenSaleInstance.tokensSold();
      })
      .then((amount) => {
        assert.equal(amount, numberOfTokens);
        return tokenInstance.balanceOf(buyer);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          numberOfTokens,
          "correct buyer balance"
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          tokensAvaliable - numberOfTokens,
          "correct amount of tokens avaliable"
        );

        // try to buy tokens with bad price
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch((err) => {
        console.log(err.message);
        assert.equal(
          err.message,
          "wrong eth amount",
          "msg.value must be equal to the correct amount "
        );
        //try to buy more tokens than the token storage
        return tokenSaleInstance.buyTokens(999999, {
          from: buyer,
          value: tokenPrice * 999999,
        });
      })
      .then(assert.fail)
      .catch((err) => {
        console.log(err.message);
        assert.equal(
          err.message,
          "cannot purchase more tokens than avaliable",
          "purchase"
        );
      });
  });
  it("end token sale", () => {
    return Token.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return TokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        // Trye end sell from admin that is not the admin
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.indexOf("revert"), "you are not a admin");
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then(() => {
        // assert.equal(success, true);
        return tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 999_990, "return all unsold tokens");
      });
  });
});
