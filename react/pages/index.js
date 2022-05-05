import Header from "../components/Header"
import Editor from "../components/Editor"
import Controls from "../components/Controls"
import TweetList from "../components/TweetList"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

import Web3Modal from "web3modal"
import CoinbaseWalletSDK from "@coinbase/wallet-sdk"
import WalletConnectProvider from "@walletconnect/web3-provider"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "web3-twitter",
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
}

let web3Modal
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true,
  })
}

export default function Index() {
  const [account, setAccount] = useState("")
  const [isOwner, setIsOwner] = useState(false)

  /**
   * Returns the connected wallet's provider
   * @returns {Object} provider
   */
  const loadProvider = async () => {
    try {
      if (web3Modal.cachedProvider) {
        const instance = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(instance)
        return provider
      } else {
        console.debug("Connect wallet first!")
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Check for a previously connected wallet, and if it belongs to the contract owner
   */
  const checkConnectedWallet = async () => {
    try {
      const provider = await loadProvider()
      const accounts = await provider.listAccounts()

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.debug("Found an authorized account:", account)

        setAccount(account)

        // Check if this is the owner's wallet
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        )
        const owner = await contract.getOwner()

        if (owner.toUpperCase() === accounts[0].toUpperCase()) {
          setIsOwner(true)
        }
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.error(error)
    }
  }

  /*
   * On page load, check for an existing wallet
   */
  useEffect(() => {
    if (account) {
      checkConnectedWallet()
    }
  }, [])

  return (
    <>
      <Header
        account={account}
        setAccount={setAccount}
        checkConnectedWallet={checkConnectedWallet}
        web3Modal={web3Modal}
      />
      <section>
        <h1>Welcome to Twitt3r</h1>
        <p>
          Twitt3r is a decentralized web3 version of Twitter built on the
          Ethereum blockchain. Connect your wallet to send, edit (!!!), delete,
          and like tw33ts! You can also check out the source code on{" "}
          <a href="https://github.com/maxpetretta/twitt3r.xyz">GitHub</a>
        </p>
      </section>
      {account && isOwner && <Controls loadProvider={loadProvider} />}
      {account && <Editor loadProvider={loadProvider} />}
      <TweetList loadProvider={loadProvider} />
      <footer>
        <p>
          Built by <a href="https://maxpetretta.com">Max Petretta</a>
        </p>
        <p>
          Check out the source code on{" "}
          <a href="https://github.com/maxpetretta/twitt3r.xyz">GitHub</a>
        </p>
      </footer>
    </>
  )
}
