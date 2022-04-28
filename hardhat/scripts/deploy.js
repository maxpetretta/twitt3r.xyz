// Deploy smart contract to Rinkeby testnet
const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log('Deploying contracts with account: ', deployer.address);
  console.log('Account balance: ', accountBalance.toString());

  const token = await hre.ethers.getContractFactory('WavePortal');
  const portal = await token.deploy({
    value: hre.ethers.utils.parseEther('1.0'), // Initial contract balance, for paying out awards
  });

  await portal.deployed();

  console.log('Contract address: ', portal.address);
};

// Run contract deployment asynchronously
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
