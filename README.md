# twitt3r.xyz
This repo contains the source code for [Twitt3r](https://twitt3r.xyz), a decentralized Twitter clone built on the [Ethereum blockchain](https://ethereum.org/en/).  The project utilizes a custom smart contract for message storage, and [ENS lookups](https://ens.domains/) for profile information.  It is deployed to the [Goerli](https://goerli.etherscan.io/address/0x3493B7ABE5e6E142D632e6596bc550A73c87Ee79) and [Ropsten](https://ropsten.etherscan.io/address/0x3493B7ABE5e6E142D632e6596bc550A73c87Ee79) testnets.

**Want to learn more?  Read all the details in [this blog post!](https://maxpetretta.com/blog/twitt3r)**

## Demo
[![A quick 60 second demo of twitt3r.xyz](./demo.gif)](https://twitt3r.xyz)

## Tech Stack
Built with the following technologies:

* [Hardhat](https://hardhat.org/): Smart contract development and testing
* [wagmi.sh](https://wagmi.sh/): React hooks for Ethereum
* [RainbowKit](https://www.rainbowkit.com/): React components for connecting wallets
* [Ethereum Name Service](https://ens.domains/): Profile pictures and descriptions
* [Next.js](https://nextjs.org/): Static site builds and routing
* [Tailwind](https://tailwindcss.com/): Adaptive CSS page styling
* [Vercel](https://vercel.com/): Web hosting and automatic deployments

## Installation

### Prereqs
To set up your own instance of Twitt3r, you will need:
* [Etherscan API key](https://etherscan.io/apis)
* [Infura API key(s)](https://infura.io/) for your chosen networks
* Deployer wallet private key with some [(test) ETH](https://faucet.paradigm.xyz/)

These values are specified in a [.env file](./hardhat/.env.example).  Once you have those, clone the repo with the following commands:
```
git clone https://github.com/maxpetretta/twitt3r.xyz
cd twitt3r.xyz/hardhat
npm install
```

This will install all dependencies for the hardhat environment.

### Smart Contract
Once you have chosen your network, use these commands to deploy:
```
npx hardhat run scripts/deploy.js --network <NETWORK_NAME>
npx hardhat verify --network <NETWORK_NAME> <CONTRACT_ADDRESS> "10" "1000000000000000" "100000000000000000"
```

Additionally, you can deploy to a local testnet by running `npx hardhat node` in a separate terminal.

### Frontend
After you've deployed the contract, you are ready to set up the frontend website.  Copy the contract address to [contract.js](./react/lib/contract.js), and optionally [the ABI](./react/lib/abi/Twitt3r.json) if you've modified the contract.  Then run:
```
cd ../react
npm install
npm run dev
open http://localhost:3000
```

## Tests
Testing your smart contract is not suggested, it is *required*.  Twitt3r comes with a baseline suite of unit tests, to ensure the contract functions as expected.  To run the test suite:
```
cd ./hardhat
npx hardhat test
```
*Note: Must be running on local testnet*

### Mock Data
Along with testing our contract, we can also add some mock data for demoing the UI.  Add mocks with `npx hardhat run scripts/mock.js`

## Future Changes
Some ideas for future enhancements to Twitt3r:
- [x] Suite of unit tests
- [x] Live demonstration video
- [ ] Gasless "likes" using wallet signatures
- [ ] Display messages from multiple networks simultaneously
- [ ] Private DMs that only the sender/receiver can decrypt
- [ ] Overhaul frontend to take advantage of [Lens Protocol](https://lens.xyz/) 🌿

## Contributions
PRs are always welcome, please tag me when you're ready for merge.
