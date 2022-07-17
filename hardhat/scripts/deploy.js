/**
 * Deploy the smart contract to the specified network
 */
const hre = require("hardhat")

const main = async () => {
  const [owner] = await hre.ethers.getSigners()
  const balance = await owner.getBalance()
  const network = hre.network.name

  console.log("Selected network:", network)
  console.log("Deploying contract with account:", owner.address)
  console.log("Account balance:", hre.ethers.utils.formatEther(balance))

  console.log("\nDeploying in 10 seconds...")
  await sleep(10000)

  const contract = await hre.ethers.getContractFactory("Twitt3r")
  const txn = await contract.deploy(
    10, // Odds
    hre.ethers.utils.parseEther("0.001"), // Price
    hre.ethers.utils.parseEther("0.1"), // Jackpot
    { value: hre.ethers.utils.parseEther("0.2") } // Initial contract balance, for paying out awards
  )

  await txn.deployed()
  console.log("\nContract address:", txn.address)
}

/**
 * Sleep the main thread for the specified number of milliseconds
 * @param {number} ms
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

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
