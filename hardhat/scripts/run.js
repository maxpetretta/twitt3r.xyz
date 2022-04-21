// Run the smart contract locally
const main = async () => {
  const [owner] = await hre.ethers.getSigners();

  // Deploy the contract
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'), // Initial contract balance, for paying out awards
  });
  await waveContract.deployed();

  console.log("\nContract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address, "\n");

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let waveCount;
  waveCount = await waveContract.getTotalWaves();

  // Send a test wave on the local blockchain
  let waveTxn = await waveContract.wave('This is a test wave');
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();

  contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );
  
  // Retrieve metadata for all senders
  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
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
