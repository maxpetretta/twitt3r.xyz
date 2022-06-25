// Deploy smart contract to Rinkeby testnet
const main = async () => {
  const [owner] = await ethers.getSigners()
  const balance = await owner.getBalance()

  console.log("Deploying contracts with account: ", owner.address)
  console.log("Account balance: ", balance.toString())

  const contract = await ethers.getContractFactory("Twitt3r")
  const txn = await contract.deploy({
    value: ethers.utils.parseEther("1.0"), // Initial contract balance, for paying out awards
  })

  await txn.deployed()

  console.log("Contract address: ", txn.address)
}

// Run contract deployment asynchronously
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
