import { ethers } from "ethers"
import abi from "../utils/WavePortal.json"
import React, { useEffect, useState } from "react"

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

export default function Home() {
  const [waves, setWaves] = useState([])
  const [account, setAccount] = useState("")
  const [message, setMessage] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const [price, setPrice] = useState(0)
  const [odds, setOdds] = useState(0)
  const [jackpot, setJackpot] = useState(0)

  const contractAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0"
  const contractABI = abi.abi

  /**
   * Returns the connected wallet's provider
   * @returns {Object} Web3Provider
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
   * Connect to a wallet using web3Modal
   */
  const connectWallet = async () => {
    try {
      await web3Modal.connect()
      setIsConnected(true)
      checkConnectedWallet()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Disconnect from the user's wallet, and clear the cached provider
   */
  const disconnectWallet = async () => {
    try {
      web3Modal.clearCachedProvider()
      setIsConnected(false)
      setAccount(null)
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
        getWaves()

        // Check if this is the owner's wallet
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        )
        const owner = await contract.getOwner()

        if (owner.toUpperCase() === accounts[0].toUpperCase()) {
          setIsOwner(true)
          getSettings()
        }
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Read the settings values from the contract, and set them in state
   */
  const getSettings = async () => {
    try {
      const provider = await loadProvider()
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      )

      const price = await contract.getPrice()
      const odds = await contract.getOdds()
      const jackpot = await contract.getJackpot()

      setPrice(ethers.utils.formatEther(price))
      setOdds(ethers.utils.formatUnits(odds, 0))
      setJackpot(ethers.utils.formatEther(jackpot))
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Submit a new wave to the contract
   */
  const wave = async () => {
    try {
      const provider = await loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      let count = await contract.getTotalWaves()
      console.debug("Retrieved total wave count...", count.toNumber())

      const txn = await contract.wave(message, {
        value: ethers.utils.parseUnits("0.0002"),
        gasLimit: 300000,
      })
      console.debug("Mining...", txn.hash)

      await txn.wait()
      console.debug("Mined -- ", txn.hash)

      count = await contract.getTotalWaves()
      console.debug("Retrieved total wave count...", count.toNumber())
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Get all waves from the chain, and set them in state
   */
  const getWaves = async () => {
    try {
      const provider = await loadProvider()
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      )

      // Listen for new wave events
      contract.on("NewWave", (index, from, timestamp, message) => {
        console.debug("NewWave", index, from, timestamp, message)

        setWaves((prevState) => [
          ...prevState,
          {
            index: index,
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ])
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Delete the specified wave from the contract
   * @param {number} index - The wave index number
   */
  const deleteWave = async (index) => {
    try {
      const provider = await loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.deleteWave(index, { gasLimit: 300000 })
      console.debug("Deleting...", txn.hash)

      await txn.wait()
      console.debug("Deleted -- ", txn.hash)

      let count = await contract.getTotalWaves()
      console.debug("Retrieved total wave count...", count.toNumber())
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Delete all waves from the contract, only for the owner
   */
  const clearWaves = async () => {
    try {
      const provider = await loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.clear({ gasLimit: 300000 })
      console.debug("Clearing...", txn.hash)

      await txn.wait()
      console.debug("Cleared -- ", txn.hash)

      let count = await contract.getTotalWaves()
      console.debug("Retrieved total wave count...", count.toNumber())
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Update the setting parameters (price, odds, jackpot) , only for the owner
   * @param {*} event - POST event from the form
   */
  const updateSettings = async (event) => {
    try {
      event.preventDefault()

      const provider = await loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.updateSettings(
        ethers.utils.parseEther(event.target.price.value),
        event.target.odds.value,
        ethers.utils.parseEther(event.target.jackpot.value),
        { gasLimit: 300000 }
      )
      console.debug("Updating...", txn.hash)

      await txn.wait()
      console.debug("Updated settings -- ", txn.hash)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Pause all transactions to the contract, only for the owner
   */
  const pauseContract = async () => {
    try {
      const provider = await loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const paused = await contract.isPaused()
      const status = paused ? "Unpaused" : "Paused"
      console.debug("Checked contract status, pause =", paused.toString())

      const txn = await contract.pause(!paused, { gasLimit: 300000 })
      console.debug("Running...", txn.hash)

      await txn.wait()
      console.debug(status, "--", txn.hash)
    } catch (error) {
      console.error(error)
    }
  }

  /*
   * On page load, check for an existing wallet
   */
  useEffect(() => {
    if (isConnected) {
      checkConnectedWallet()
    }
  }, [])

  /**
   * Main page content
   */
  return (
    <div>
      <div>
        <div>👋 Hey there!</div>
        <div>
          My name is Max, and I'm learning about web3 with{" "}
          <a href="https://buildspace.so">Buildspace</a>. Connect your Ethereum
          wallet to wave at me!
        </div>

        {!account && <button onClick={connectWallet}>Connect Wallet</button>}

        {account && (
          <>
            <input
              type="text"
              id="messageBox"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={wave}>Wave at Me</button>
            <button onClick={disconnectWallet}>Disconnect Wallet</button>
          </>
        )}

        {account && isOwner && (
          <div>
            <h3>Owner Settings</h3>
            <form onSubmit={updateSettings}>
              <div>
                <div>
                  <label>Wave Price: {price}Ξ</label>
                  <input
                    type="number"
                    step="any"
                    id="price"
                    placeholder="Price in Ether"
                    required
                  />
                  <label>Lottery Odds: {odds}%</label>
                  <input
                    type="number"
                    id="odds"
                    placeholder="Odds 0 - 100%"
                    required
                  />
                  <label>Lottery Jackpot: {jackpot}Ξ</label>
                  <input
                    type="number"
                    step="any"
                    id="jackpot"
                    placeholder="Prize in Ether"
                    required
                  />
                </div>
                <div>
                  <button type="button" onClick={clearWaves}>
                    Clear All Waves
                  </button>
                  <button type="button" onClick={pauseContract}>
                    Pause Contract
                  </button>
                  <button>Submit Changes</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {waves.map((wave, index) => {
          return (
            <div key={index}>
              <button onClick={() => deleteWave(wave.index)}>✕</button>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
