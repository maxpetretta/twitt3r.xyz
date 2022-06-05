import toast from "react-hot-toast"
import { ethers } from "ethers"
import { useState } from "react"
import { useContractRead, useContractWrite } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract"

export default function Controls() {
  const [price, setPrice] = useState(0)
  const [odds, setOdds] = useState(0)
  const [jackpot, setJackpot] = useState(0)

  /**
   * Contract hooks
   */
  const { data: priceData, error: priceError, refetch: priceRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getPrice",
    {
      onSuccess(data) {
        setPrice(ethers.utils.formatEther(data))
      }
    }
  )

  const { data: oddsData, error: oddsError, refetch: oddsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getOdds",
    {
      onSuccess(data) {
        setOdds(ethers.utils.formatUnits(data, 0))
      }
    }
  )

  const { data: jackpotData, error: jackpotError, refetch: jackpotRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getJackpot",
    {
      onSuccess(data) {
        setJackpot(ethers.utils.formatEther(data))
      }
    }
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
        toast.success("Updated settings")
        console.debug("Updated settings --", data.hash)
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
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
        toast.success("Cleared tweets")
        console.debug("Cleared --", data.hash)
        totalTweetsRefetch().then((value) => {
          console.debug("Retrieved total tweet count --", value.data.toNumber())  
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
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
          toast.success(status, " contract")
          console.debug(status, "--", data.hash)
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      }
    }
  )

  const { data: unpauseData, error: unpauseError, write: unpause } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "unpause",
    {
      onSuccess(data) {
        let status
        isPausedRefetch().then((value) => {
          status = value.data ? "Unpaused" : "Paused"
          toast.success(status, " contract")
          console.debug(status, "--", data.hash)
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      }
    }
  )

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
      toast.error("Transaction error")
      console.error("Transaction error --", error)
    }
  }

  /**
   * Delete all tweets from the contract, only for the owner
   */
  const clearTweets = async () => {
    try {
      clear()
    } catch (error) {
      toast.error("Transaction error")
      console.error("Transaction error --", error)
    }
  }

  /**
   * Pause all transactions to the contract, only for the owner
   */
  const pauseContract = () => {
    try {
      console.debug("Checked contract status, pause =", isPausedData.toString())

      if (isPausedData) {
        unpause()
      } else {
        pause()
      }
    } catch (error) {
      toast.error("Transaction error")
      console.error("Transaction error --", error)
    }
  }

  return (
    <section className="m-3 p-3 bg-gray-100 rounded-xl">
      <h3>Contract Settings</h3>
      <p className="mt-1">Welcome, owner! You may modify the contract settings below:</p>
      <form onSubmit={updateContractSettings}>
        <div className="flex mt-3">
          <label>Price:</label>
          <input
            id="price"
            type="number"
            step="any"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price in Ether"
            className="w-full text-right bg-gray-100"
            required
          />
          <span>Ξ</span>
        </div>
        <div className="flex mt-1">
          <label>Odds:</label>
          <input
            id="odds"
            type="number"
            value={odds}
            onChange={e => setOdds(e.target.value)}
            placeholder="0 - 100"
            className="w-full text-right bg-gray-100"
            required
          />
          <span>%</span>
        </div>
        <div className="flex mt-1">
          <label>Jackpot:</label>
          <input
            id="jackpot"
            type="number"
            step="any"
            value={jackpot}
            onChange={e => setJackpot(e.target.value)}
            placeholder="Prize in Ether"
            className="w-full text-right bg-gray-100"
            required
          />
          <span>Ξ</span>
        </div>
        <div className="flex flex-col mt-6">
          <button className="button mx-6">Submit Changes</button>
          <button className="button mx-6 mt-3" type="button" onClick={pauseContract}>
            Pause Contract
          </button>
          <button className="button mx-6 mt-3" type="button" onClick={clearTweets}>
            Clear All Tw33ts
          </button>
        </div>
      </form>
    </section>
  )
}
