import { useContractRead, useContractWrite, useEnsName } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Tweet(props) {
  /**
   * Contract hooks
   */
  const { data: totalTweetsData, error: totalTweetsError, refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { data: editData, error: editError, write: editTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "editTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          console.debug("Edited --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  const { data: deleteData, error: deleteError, write: deleteTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "deleteTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          console.debug("Deleted --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  /**
   * Update the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
   const updateTweet = async (id, message) => {
    try {
      editTweet({
        args: [id, message]
      })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Delete the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  const removeTweet = async (id) => {
    try {
      deleteTweet({
        args: [id]
      })
    } catch (error) {
      console.error(error)
    }
  }

  const getEnsName = (address) => {
    try {
      const { data, isSuccess } = useEnsName({
        address: address
      })

      if (isSuccess) {
        return data
      } else {
        const match = address.match(/^(0x.{4}).+(.{4})$/)
        return (match[1] + "..." + match[2])
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div>
        <button onClick={() => removeTweet(props.id)}>✕</button>
        <div>From: {getEnsName(props.tweet.from)}</div>
        <div>Time: {props.tweet.timestamp.toLocaleString("en-US", { timeStyle: "short", dateStyle: "short" })}</div>
        <div>Message: {props.tweet.message}</div>
      </div>
    </>
  )
}
