const chai = require("chai");
const { ethers } = require("hardhat");
const { expect } = chai;
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

const TOTAL_SUPPLY = 1_000_000;

describe("Token", () => {
  let Token, tokenInstance;
  beforeEach(async () => {
    Token = await ethers.getContractFactory("Token");
    tokenInstance = await Token.deploy(TOTAL_SUPPLY);
    [admin, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deploy", () => {
    it("initialize the token with the correct value", async () => {
      expect(await tokenInstance.name()).to.equal("RACToken");
      expect(await tokenInstance.symbol()).to.equal("RAC");
    });
    it("sets total supply upon deployment", async () => {
      const totalSupply = await tokenInstance.totalSupply();
      expect(totalSupply).to.equal(TOTAL_SUPPLY);
      const adminBalance = await tokenInstance.balanceOf(admin.address);
      expect(adminBalance).to.equal(totalSupply);
    });
  });
  describe("Transactions", () => {
    it("transfer Tokens", async () => {
      await tokenInstance.transfer(addr1.address, 50);
      const addr1Balance = await tokenInstance.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await tokenInstance.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await tokenInstance.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
    it("fail transaction not enought tokens", async () => {
      const initialBalance = await tokenInstance.balanceOf(admin.address);
      await expect(
        tokenInstance.connect(addr1).transfer(admin.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      const adminActualBalance = await tokenInstance.balanceOf(admin.address);
      expect(adminActualBalance).to.equal(initialBalance);
    });
    it("balance deducts from transfer", async () => {
      const initialBalance = await tokenInstance.balanceOf(admin.address);
      const amount = 10;
      await tokenInstance.transfer(addr1.address, amount);

      const actualBalance = await tokenInstance.balanceOf(admin.address);
      expect(actualBalance).to.equal(initialBalance - amount);
    });
    it("transfer event emmited", async () => {
      await expect(tokenInstance.transfer(addr1.address, 1))
        .to.emit(tokenInstance, "Transfer")
        .withArgs(admin.address, addr1.address, 1);
    });
  });
  describe("delegate transactions", () => {
    it("approve transaction", async () => {
      await tokenInstance.approve(addr1.address, 100);
      expect(
        await tokenInstance.allowance(admin.address, addr1.address)
      ).to.equal(100);
    });
    it("Approve event", async () => {
      await expect(tokenInstance.approve(addr1.address, 100))
        .to.emit(tokenInstance, "Approval")
        .withArgs(admin.address, addr1.address, 100);
    });
    it("fail transfer from not enought approve coins", async () => {
      await tokenInstance.approve(addr1.address, 10);
      expect(
        tokenInstance
          .connect(addr1)
          .transferFrom(admin.address, addr2.address, 11)
      ).to.be.reverted;
    });

    it("transfer from", async () => {
      await tokenInstance.approve(addr1.address, 10);

      await tokenInstance
        .connect(addr1)
        .transferFrom(admin.address, addr2.address, 10);
      expect(await tokenInstance.balanceOf(addr2.address)).to.equal(10);
    });

    it("deducts transfer from allowance", async () => {
      await tokenInstance.approve(addr1.address, 10);

      await tokenInstance
        .connect(addr1)
        .transferFrom(admin.address, addr2.address, 10);
      expect(await tokenInstance.balanceOf(addr2.address)).to.equal(10);
      expect(
        await tokenInstance.allowance(admin.address, addr1.address)
      ).to.equal(0);
    });
  });
});
