import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Controls(props) {
  const [price, setPrice] = useState(0)
  const [odds, setOdds] = useState(0)
  const [jackpot, setJackpot] = useState(0)

  /**
   * Read the settings values from the contract, and set them in state
   */
  const getSettings = async () => {
    try {
      const provider = await props.loadProvider()
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
   * Update the setting parameters (price, odds, jackpot) , only for the owner
   * @param {*} event - POST event from the form
   */
  const updateSettings = async (event) => {
    try {
      event.preventDefault()

      const provider = await props.loadProvider()
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
   * Delete all tweets from the contract, only for the owner
   */
  const clearTweets = async () => {
    try {
      const provider = await props.loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.clear({ gasLimit: 300000 })
      console.debug("Clearing...", txn.hash)

      await txn.wait()
      console.debug("Cleared -- ", txn.hash)

      let count = await contract.getTotalTweets()
      console.debug("Retrieved total tweet count...", count.toNumber())
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Pause all transactions to the contract, only for the owner
   */
  const pauseContract = async () => {
    try {
      const provider = await props.loadProvider()
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
   * On page load, get the current contract settings
   */
  useEffect(() => {
    getSettings()
  }, [])

  return (
    <section>
      <h3>Contract Settings</h3>
      <p>Welcome, owner! You may modify the contract settings below:</p>
      <form onSubmit={updateSettings}>
        <div>
          <label>Tw33t Price:</label>
          <input
            id="price"
            type="number"
            step="any"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price in Ether"
            required
          />
          <span>Ξ</span>
          <label>Lottery Odds:</label>
          <input
            id="odds"
            type="number"
            value={odds}
            onChange={e => setOdds(e.target.value)}
            placeholder="0 - 100%"
            required
          />
          <span>%</span>
          <label>Lottery Jackpot:</label>
          <input
            id="jackpot"
            type="number"
            step="any"
            value={jackpot}
            onChange={e => setJackpot(e.target.value)}
            placeholder="Prize in Ether"
            required
          />
          <span>Ξ</span>
        </div>
        <div>
          <button type="button" onClick={clearTweets}>
            Clear All Tweets
          </button>
          <button type="button" onClick={pauseContract}>
            Pause Contract
          </button>
          <button>Submit Changes</button>
        </div>
      </form>
    </section>
  )
}
