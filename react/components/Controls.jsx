import { ethers } from "ethers"
import { useState, useEffect } from "react"
import { useAccount, useContractRead, useContractWrite } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract"

export default function Controls(props) {
  const [price, setPrice] = useState(0)
  const [odds, setOdds] = useState(0)
  const [jackpot, setJackpot] = useState(0)

  const account = useAccount()

  /**
   * Contract hooks
   */
  const { data: priceData, error: priceError, refetch: priceRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getPrice"
  )

  const { data: oddsData, error: oddsError, refetch: oddsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getOdds"
  )

  const { data: jackpotData, error: jackpotError, refetch: jackpotRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getJackpot"
  )

  const { data: totalTweetsData, error: totalTweetsError, refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { data: isPausedData, error: isPausedError, refetch: isPausedRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "isPaused"
  )

  const { data: settingsData, error: settingsError, write: updateSettings } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "updateSettings",
    {
      onSuccess(data) {
        console.debug("Updated settings --", data.hash)
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  const { data: clearData, error: clearError, write: clear } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "clear",
    {
      onSuccess(data) {
        console.debug("Cleared --", data.hash)
        totalTweetsRefetch().then((value) => {
          console.debug("Retrieved total tweet count --", value.data.toNumber())  
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  const { data: pauseData, error: pauseError, write: pause } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "pause",
    {
      onSuccess(data) {
        let status
        isPausedRefetch().then((value) => {
          status = value.data ? "Unpaused" : "Paused"
          console.debug(status, "--", data.hash)
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  /**
   * Read the settings values from the contract, and set them in state
   */
  const getSettings = async () => {
    try {
      priceRefetch()
      oddsRefetch()
      jackpotRefetch()
  
      setPrice(ethers.utils.formatEther(priceData))
      setOdds(ethers.utils.formatUnits(oddsData, 0))
      setJackpot(ethers.utils.formatEther(jackpotData))
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Update the setting parameters (price, odds, jackpot) , only for the owner
   * @param {*} event - POST event from the form
   */
  const updateContractSettings = async (event) => {
    try {
      event.preventDefault()

      updateSettings({
        args: [
          ethers.utils.parseEther(event.target.price.value),
          event.target.odds.value,
          ethers.utils.parseEther(event.target.jackpot.value),
        ]
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Delete all tweets from the contract, only for the owner
   */
  const clearTweets = async () => {
    try {
      clear()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Pause all transactions to the contract, only for the owner
   */
  const pauseContract = () => {
    try {
      console.debug("Checked contract status, pause =", isPausedData.toString())
  
      pause({
        args: [!isPausedData]
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * On page load, get the current contract settings
   */
  useEffect(() => {
    if (account) {
      getSettings()
    }
  }, [])

  return (
    <section>
      <h3>Contract Settings</h3>
      <p>Welcome, owner! You may modify the contract settings below:</p>
      <form onSubmit={updateContractSettings}>
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
