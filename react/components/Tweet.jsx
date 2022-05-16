import { useContractRead, useContractWrite } from "wagmi"
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

  return (
    <>
      <div>
        <button onClick={() => removeTweet(props.id)}>✕</button>
        <div>From: {props.tweet.from}</div>
        <div>Time: {props.tweet.timestamp.toString()}</div>
        <div>Message: {props.tweet.message}</div>
      </div>
    </>
  )
}
