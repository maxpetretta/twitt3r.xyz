/**
 * Run a series of tests on the smart contract locally
 */
const hre = require("hardhat")
const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Twitt3r contract", function () {
  async function twitt3rFixture() {
    const accounts = await hre.ethers.getSigners()
    const owner = accounts[0]
    const price = { value: hre.ethers.utils.parseEther("0.001") }
    const contract = await hre.ethers.getContractFactory("Twitt3r")

    const twitt3r = await contract.deploy(
      1, // Odds
      hre.ethers.utils.parseEther("0.001"), // Price
      hre.ethers.utils.parseEther("0.1"), // Jackpot
      { value: hre.ethers.utils.parseEther("0.2") } // Initial contract balance, for paying out awards
    )
  
    await twitt3r.deployed()
    return { twitt3r, owner, price, accounts }
  }

  describe("Deployment", function () {
    it("Should set the right contract owner", async function() {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      expect(await twitt3r.getOwner()).to.equal(owner.address)
    })

    it("Should receive the right initial amount of Ether", async function() {
      const { twitt3r } = await loadFixture(twitt3rFixture)
      expect(await twitt3r.getBalance()).to.equal(hre.ethers.utils.parseEther("0.2"))
    })

    it("Should set the right price to tweet", async function () {
      const { twitt3r } = await loadFixture(twitt3rFixture)
      expect(await twitt3r.getPrice()).to.equal(hre.ethers.utils.parseEther("0.001"))
    })

    it("Should set the right lottery jackpot amount", async function() {
      const { twitt3r } = await loadFixture(twitt3rFixture)
      expect(await twitt3r.getJackpot()).to.equal(hre.ethers.utils.parseEther("0.1"))
    })

    it("Should set the right lottery winning odds", async function() {
      const { twitt3r } = await loadFixture(twitt3rFixture)
      expect(await twitt3r.getOdds()).to.equal(1)
    })
  })

  describe("New tweets", function () {
    it("Should allow users to tweet", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(owner).newTweet("Test message", 0, 0, price)).to.emit(twitt3r, "NewTweet")
    })
  
    it("Should not allow users to tweet when paying the wrong price", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(owner).newTweet("Test message", 0, 0, { value: hre.ethers.utils.parseEther("0") })).to.be.revertedWithCustomError(twitt3r, "InvalidPrice")
    })
  
    it("Should not allow users to tweet with more than 280 characters", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(owner).newTweet("01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890", 0, 0, price)).to.be.revertedWithCustomError(twitt3r, "InvalidMessage")
    })
  
    it("Should not allow users to tweet within the 1 minute cooldown", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.newTweet("Second message", 0, 0, price)).to.be.revertedWithCustomError(twitt3r, "SenderCooldown")
    })
  })

  describe("Edit tweets", function () {
    it("Should allow users to edit tweets", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.editTweet(1, "Edited message")).to.emit(twitt3r, "EditTweet")
    })
  
    it("Should not allow users to edit invalid tweets", async function () {
      const { twitt3r, owner, price} = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.editTweet(2, "Edited message")).to.be.revertedWithCustomError(twitt3r, "InvalidID")
    })
  
    it("Should not allow users to edit deleted tweets", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await twitt3r.deleteTweet(1)
      await expect(twitt3r.editTweet(1, "Edited message")).to.be.revertedWithCustomError(twitt3r, "DeletedTweet")
    })
  
    it("Should not allow users to edit others' tweets", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.connect(accounts[1]).editTweet(1, "Edited message")).to.be.revertedWithCustomError(twitt3r, "Unauthorized")
    })
  
    it("Should not allow users to edit with more than 280 characters", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.editTweet(1, "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890")).to.be.revertedWithCustomError(twitt3r, "InvalidMessage")
    })
  })

  describe("Delete tweets", function () {
    it("Should allow user to delete tweets", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.deleteTweet(1)).to.emit(twitt3r, "DeleteTweet")
    })

    it("Should not allow users to delete invalid tweets", async function () {
      const { twitt3r, owner, price} = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.deleteTweet(2)).to.be.revertedWithCustomError(twitt3r, "InvalidID")
    })

    it("Should not allow users to delete deleted tweets", async function () {
      const { twitt3r, owner, price} = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await twitt3r.deleteTweet(1)
      await expect(twitt3r.deleteTweet(1)).to.be.revertedWithCustomError(twitt3r, "DeletedTweet")
    })

    it("Should not allow users to delete others' tweets", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.connect(accounts[1]).deleteTweet(1)).to.be.revertedWithCustomError(twitt3r, "Unauthorized")
    })
  })

  describe("Pause contract", function () {
    it("Should allow the owner to pause the contract", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      expect(await twitt3r.isPaused()).to.equal(true)
    })

    it("Should now allow users to pause the contract", async function () {
      const { twitt3r, price, owner, accounts } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(accounts[1]).pause()).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should allow the owner to unpause the contract", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      await twitt3r.connect(owner).unpause()
      expect(await twitt3r.isPaused()).to.equal(false)
    })

    it("Should now allow users to unpause the contract", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      await expect(twitt3r.connect(accounts[1]).unpause()).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should block new tweets when the contract is paused", async function () {
      const { twitt3r, owner, price} = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      await expect(twitt3r.newTweet("Test message", 0, 0, price)).to.be.revertedWith("Pausable: paused")
    })

    it("Should block editing tweets when the contract is paused", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      await expect(twitt3r.editTweet(1, "Edited message")).to.be.revertedWith("Pausable: paused")
    })

    it("Should block deleting tweets when the contract is paused", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).pause()
      await expect(twitt3r.deleteTweet(1)).to.be.revertedWith("Pausable: paused")
    })
  })

  describe("Owner controls", function () {
    it("Should allow the owner to withdraw from the contract balance", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).withdraw()
      expect(await twitt3r.getBalance()).to.equal(0)
    })

    it("Should not allow users to withdraw from the contract balance", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(accounts[1]).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should allow the owner to clear all tweets", async function () {
      const { twitt3r, owner, price} = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.clear()).to.emit(twitt3r, "ClearTweets")
    })

    it("Should not allow users to clear all tweets", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).newTweet("Test message", 0, 0, price)
      await expect(twitt3r.connect(accounts[1]).clear()).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should allow the owner to update the contract settings", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).updateSettings(20, hre.ethers.utils.parseEther("0.001"), hre.ethers.utils.parseEther("0.1"))
      expect(await twitt3r.getOdds()).to.equal(20)
    })

    it("Should not allow users to update the contract settings", async function () {
      const { twitt3r, owner, price, accounts } = await loadFixture(twitt3rFixture)
      await expect(twitt3r.connect(accounts[1]).updateSettings(20, hre.ethers.utils.parseEther("0.001"), hre.ethers.utils.parseEther("0.1"))).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Lottery payout", function () {
    it("Should allow anyone to deposit into the contract", async function () {
      const { twitt3r, owner } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).deposit({ value: hre.ethers.utils.parseEther("0.1") })
      expect(await twitt3r.getBalance()).to.equal(hre.ethers.utils.parseEther("0.3"))
    })

    it("Should pay out a lottery to a winning user", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).updateSettings(100, hre.ethers.utils.parseEther("0.001"), hre.ethers.utils.parseEther("0.1"))
      await expect(twitt3r.newTweet("Test message", 0, 0, price)).to.emit(twitt3r, "WonLottery")
    })

    it("Should skip the lottery payout if the contract balance is too low", async function () {
      const { twitt3r, owner, price } = await loadFixture(twitt3rFixture)
      await twitt3r.connect(owner).withdraw()
      await twitt3r.updateSettings(100, hre.ethers.utils.parseEther("0.001"), hre.ethers.utils.parseEther("0.1"))
      await expect(twitt3r.newTweet("Test message", 0, 0, price)).to.be.revertedWithCustomError(twitt3r, "InsufficientBalance")
    })
  })
})
