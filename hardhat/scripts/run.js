// Run the smart contract locally
const main = async () => {
  const [owner] = await ethers.getSigners();

  // Deploy the contract
  const contractFactory = await ethers.getContractFactory('Twitt3r');
  const contract = await contractFactory.deploy({
    value: ethers.utils.parseEther('0.1'), // Initial contract balance, for paying out awards
  });
  await contract.deployed();

  console.log("\nContract deployed to:", contract.address);
  console.log("Contract deployed by:", owner.address, "\n");

  let balance = await ethers.provider.getBalance(
    contract.address
  );
  console.log(
    'Contract balance:',
    ethers.utils.formatEther(balance)
  );

  let count;
  count = await contract.getTotalTweets();

  // Send a test tweet on the local blockchain
  let txn = await contract.sendTweet('This is a test tweet');
  await txn.wait();

  count = await contract.getTotalTweets();

  balance = await ethers.provider.getBalance(
    contract.address
  );
  console.log(
    'Contract balance:',
    ethers.utils.formatEther(balance)
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
    console.error(error);
    process.exit(1);
  }
};

runMain();
