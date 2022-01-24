const chai = require("chai");
const { ethers } = require("hardhat");
const { expect } = chai;
const { solidity } = require("ethereum-waffle");
const { utils } = require("ethers");
const { parseEther } = utils;

const TOTAL_SUPPLY = 1_000_000;
const TOKEN_PRICE = "0.001";
const TOKENS_AVALIABLE = 750_000;

chai.use(solidity);

describe("Token Sale", () => {
  let TokenSale, Token, tokenSaleInstance, tokenInstance;
  beforeEach(async () => {
    Token = await ethers.getContractFactory("Token");
    TokenSale = await ethers.getContractFactory("TokenSale");
    tokenInstance = await Token.deploy(TOTAL_SUPPLY);
    tokenSaleInstance = await TokenSale.deploy(
      tokenInstance.address,
      parseEther(TOKEN_PRICE)
    );
    [admin, buyer] = await ethers.getSigners();
  });
  describe("Deploy", () => {
    it("initialize contract", async () => {
      expect(await tokenSaleInstance.tokenContract()).to.be.properAddress;
      expect(await tokenSaleInstance.tokenPrice()).to.equal(
        parseEther(TOKEN_PRICE)
      );
    });
  });
  describe("Token buying", () => {
    beforeEach(async () => {
      // Provision 75% of all tokens to the token sale
      await tokenInstance
        .connect(admin)
        .transfer(tokenSaleInstance.address, TOKENS_AVALIABLE);
    });
    it("fail buy token msg value with wrong amount", async () => {
      await expect(
        tokenSaleInstance.connect(buyer).buyTokens(10, {
          value: 1,
        })
      ).to.be.revertedWith("wrong eth amount");
    });
    // ------------------ FALLOOOOO ---------------
    it("fail purchase more tokens than avaliable", async () => {
      const tokenAmount = TOKENS_AVALIABLE + 1;
      await expect(
        tokenSaleInstance.connect(buyer).buyTokens(tokenAmount, {
          value: tokenAmount * parseEther(TOKEN_PRICE),  // the problem is the overflow of this operation if you decreae the quantity of token avaliable to 7 it pass normally 
        })
      ).to.be.revertedWith("cannot purchase more tokens than avaliable");
    });
    // ------- :( ------------------------
    it("purchase tokens", async () => {
      const tokenAmount = 1;
      await tokenSaleInstance.connect(buyer).buyTokens(tokenAmount, {
        value: tokenAmount * parseEther(TOKEN_PRICE),
      });
      expect(await tokenInstance.balanceOf(buyer.address)).to.equal(
        tokenAmount
      );
    });
  });
  describe("End sale", () => {
    it("end sale fail you are not a admin", async () => {
      await expect(tokenSaleInstance.connect(buyer).endSale()).to.be.reverted;
    });
    it("end sale fail you are not a admin", async () => {
      await tokenSaleInstance.connect(admin).endSale();
      expect(await tokenInstance.balanceOf(admin.address)).to.equal(
        TOTAL_SUPPLY
      );
    });
  });
});
