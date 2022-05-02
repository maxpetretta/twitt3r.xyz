// Run the smart contract locally
const main = async () => {
  const [owner] = await hre.ethers.getSigners();

  // Deploy the contract
  const contractFactory = await hre.ethers.getContractFactory('Twitt3r');
  const contract = await contractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'), // Initial contract balance, for paying out awards
  });
  await contract.deployed();

  console.log("\nContract deployed to:", contract.address);
  console.log("Contract deployed by:", owner.address, "\n");

  let contractBalance = await hre.ethers.provider.getBalance(
    contract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let count;
  count = await contract.getTotalTweets();

  // Send a test tweet on the local blockchain
  let txn = await contract.tweet('This is a test tweet');
  await txn.wait();

  count = await contract.getTotalTweets();

  contractBalance = await hre.ethers.provider.getBalance(
    contract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );
  
  // Retrieve metadata for all senders
  let tweets = await contract.getAllTweets();
  console.log(tweets);
}; 

// Run contract asynchronously
const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
