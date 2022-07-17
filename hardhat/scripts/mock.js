/**
 * Deploy the smart contract locally, adding mock data and simulating a jackpot win
 */
const hre = require("hardhat")

const main = async () => {
  const accounts = await hre.ethers.getSigners()
  const owner = accounts[0]
  const balance = await owner.getBalance()
  const network = hre.network.name
  const options = { value: hre.ethers.utils.parseEther("0.001") }

  const messages = ["gm", "Hello Twitt3r!", "Wen merge", "web3 is so cool!", "Ethereum is the future", "Who's in NYC?", "How is this website free 😂", "Alright, time for a thread 🧵:"]
  const replies = ["gm", "This is the way", "To the moon!", "iAintReadingAllThat.jpg", "Brutal", "Let's goooo", "Soon™️", "DM me", "Rugged again 😭", "🔥", "🫡"]

  // Exit early if not on localhost
  if (network != "localhost") {
    console.log("Mock script can only be ran on localhost!")
    return
  }

  console.log("Selected network:", network)
  console.log("Deploying contract with account:", owner.address)
  console.log("Account balance:", hre.ethers.utils.formatEther(balance))

  console.log("\nDeploying in 5 seconds...")
  await sleep(5000)

  const contract = await hre.ethers.getContractFactory("Twitt3r")
  const twitt3r = await contract.deploy(
    0, // Odds
    hre.ethers.utils.parseEther("0.001"), // Price
    hre.ethers.utils.parseEther("0.1"), // Jackpot
    { value: hre.ethers.utils.parseEther("0.2") } // Initial contract balance, for paying out awards
  )

  await twitt3r.deployed()
  let contractBalance = await hre.ethers.provider.getBalance(twitt3r.address)
  console.log("\nContract address:", twitt3r.address)
  console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance))

  // Send a test tweet from the owner address
  let txn = await twitt3r.newTweet("Hello, world!", 0, 0, options)
  await txn.wait()

  // Simulate usage across several accounts
  let id = 0
  for (let i = 0; i < 20; i++) {
    const account = accounts[rng(0, accounts.length)]
    
    switch(rng(0, 3)) {
      case 0: // Top-level tweet
        txn = await twitt3r.connect(account).newTweet(messages[rng(0, messages.length)], 0, 0, options)
        await txn.wait()
        break
      case 1: // Reply tweet
        txn = await twitt3r.connect(account).newTweet(replies[rng(0, replies.length)], rng(1, id + 1), 0, options)
        await txn.wait()
        break
      case 2: // Retweet
        txn = await twitt3r.connect(account).newTweet("", 0, rng(1, id + 1), options)
        await txn.wait()
        break
      default:
        console.log("An error occurred!")
    }
    fastforward(60)
    id++
  }

  // Simulate a user winning the contract lottery
  txn = await twitt3r.updateSettings(
    100, // Odds
    hre.ethers.utils.parseEther("0.001"), // Price
    hre.ethers.utils.parseEther("0.1"), // Jackpot
  )
  await txn.wait()

  contractBalance = await twitt3r.getBalance()
  console.log("\nBefore jackpot balance:", hre.ethers.utils.formatEther(contractBalance))

  txn = await twitt3r.newTweet("Jackpot!", 0, 0, options)
  await txn.wait()
  contractBalance = await twitt3r.getBalance()
  console.log("After jackpot balance:", hre.ethers.utils.formatEther(contractBalance))

  // Print tweet information
  const count = await twitt3r.getTotalTweets()
  console.log("Total tweets sent:", count.toNumber())

  const tweets = await twitt3r.getTweets()
  console.log("\n----- Sent Tweets -----\n", tweets)
}

/**
 * Sleep the main thread for the specified number of milliseconds
 * @param {number} ms
 */
const sleep = (ms) => { new Promise(resolve => setTimeout(resolve, ms)) }

/**
 * Returns a random number within the given range
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const rng = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * Fast forwards the local hardhat chain by the specified number of seconds
 * @param {number} seconds 
 */
const fastforward = async (seconds) => {
  await hre.network.provider.send("evm_increaseTime", [seconds])
  await hre.network.provider.send("evm_mine")
}

/**
 * Execute the main script
 */
const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

runMain()
