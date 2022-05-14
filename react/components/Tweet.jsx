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

   const { data: deleteData, error: deleteError, write: deleteTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "deleteTweet",
    {
      onSuccess(data) {
        const count = totalTweetsData
        console.debug("Deleted --", data.hash)
        console.debug("Retrieved total tweet count --", count.toNumber())
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )


  /**
   * Delete the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  const deleteSelectedTweet = async (id) => {
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
        <button onClick={() => deleteSelectedTweet(props.id)}>✕</button>
        <div>From: {props.tweet.from}</div>
        <div>Time: {props.tweet.timestamp.toString()}</div>
        <div>Message: {props.tweet.message}</div>
      </div>
    </>
  )
}
