import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import "./App.css"
import abi from "./utils/WavePortal.json"

import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import CoinbaseWalletSDK from "@coinbase/wallet-sdk"

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

const web3Modal = new Web3Modal({
  providerOptions,
  cacheProvider: true,
})

const App = () => {
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
   * Connect to the user's wallet
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

  const connectWallet = async () => {
    try {
      await web3Modal.connect()

      setIsConnected(true)
      checkConnectedWallet()
    } catch (error) {
      console.error(error)
    }
  }

  const disconnectWallet = async () => {
    try {
      web3Modal.clearCachedProvider()
      setIsConnected(false)
      setAccount(null)
    } catch (error) {
      console.error(error)
    }
  }

  const checkConnectedWallet = async () => {
    /*
     * First make sure we have access to the provider
     */
    try {
      const provider = await loadProvider()
      const accounts = await provider.listAccounts()

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.debug("Found an authorized account:", account)

        setAccount(account)
        getWaves()

        /*
         * Check if this wallet belongs to the owner
         */
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

  const getWaves = async () => {
    try {
      const provider = await loadProvider()
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      )

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

  const deleteWave = async (index) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const txn = await contract.deleteWave(index, { gasLimit: 300000 })
        console.debug("Deleting...", txn.hash)

        await txn.wait()
        console.debug("Deleted -- ", txn.hash)

        let count = await contract.getTotalWaves()
        console.debug("Retrieved total wave count...", count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.error(error)
    }
  }

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

  /*
   * Main page content
   */
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          My name is Max, and I'm learning about web3 with{" "}
          <a href="https://buildspace.so">Buildspace</a>. Connect your Ethereum
          wallet to wave at me!
        </div>

        {!account && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {account && (
          <>
            <input
              type="text"
              id="messageBox"
              className="messageBox"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="waveButton" onClick={wave}>
              Wave at Me
            </button>
            <button className="waveButton" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          </>
        )}

        {account && isOwner && (
          <div className="message">
            <h3>Owner Settings</h3>
            <form onSubmit={updateSettings}>
              <div className="ownerForm">
                <div className="ownerSettings">
                  <label>Wave Price: {price}Ξ</label>
                  <input
                    type="number"
                    step="any"
                    id="price"
                    className="textBox"
                    placeholder="Price in Ether"
                    required
                  />
                  <label>Lottery Odds: {odds}%</label>
                  <input
                    type="number"
                    id="odds"
                    className="textBox"
                    placeholder="Odds 0 - 100%"
                    required
                  />
                  <label>Lottery Jackpot: {jackpot}Ξ</label>
                  <input
                    type="number"
                    step="any"
                    id="jackpot"
                    className="textBox"
                    placeholder="Prize in Ether"
                    required
                  />
                </div>
                <div className="ownerButtons">
                  <button
                    className="waveButton"
                    type="button"
                    onClick={clearWaves}
                  >
                    Clear All Waves
                  </button>
                  <button
                    className="waveButton"
                    type="button"
                    onClick={pauseContract}
                  >
                    Pause Contract
                  </button>
                  <button className="waveButton" type="submit">
                    Submit Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {waves.map((wave, index) => {
          return (
            <div key={index} className="message">
              <button
                onClick={() => deleteWave(wave.index)}
                className="deleteButton"
              >
                ✕
              </button>
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

export default App
