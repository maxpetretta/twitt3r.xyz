import { useState } from "react"
import { useContractRead, useContractWrite } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Editor() {
  const [message, setMessage] = useState("")

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

   const { data: totalTweetsData, error: totalTweetsError, refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

   const { data: tweetData, error: tweetError, write: newTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          console.debug("Tweeted --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  /**
   * Submit a new tweet to the contract
   */
  const sendTweet = async () => {
    try {
      priceRefetch().then((value) => {
        newTweet({
          args: message.toString(),
          overrides: { value: value.data }
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section>
      <label>Tw33t Editor</label>
      <input
        type="text"
        value={message}
        maxLength="280"
        placeholder="What's happening?"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendTweet}>Tw33t</button>
    </section>
  )
}
