import { useState } from "react"
import { useContractRead, useContractWrite } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Editor(props) {
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

   const { data: tweetData, error: tweetError, write: tweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "sendTweet",
    {
      onSuccess(data) {
        const count = totalTweetsData
        console.debug("Sent tweet --", data.hash)
        console.debug("Retrieved total tweet count --", count.toNumber())
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
        console.log(value)
        sendTweet({
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
        placeholder="What's happening?"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendTweet}>Tw33t</button>
    </section>
  )
}
