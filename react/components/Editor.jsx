import { useState } from "react"
import { useAccount, useContractRead, useContractWrite, useEnsAvatar } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Editor() {
  const [message, setMessage] = useState("")

  const { data: account } = useAccount()
  
  /**
   * Contract hooks
   */
  const { data: avatar, isSuccess: avatarSuccess, refetch: avatarRefetch } = useEnsAvatar({
    addressOrName: account ? account.address : "",
    onError(error) {
      console.log(error)
    }
  })

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
    <section className="flex flex-col border">
      <h2 className="mt-4 ml-3">Latest Tw33ts</h2>
      <div className="mt-2 flex items-center">
        <img src={avatar} className={ avatar ? "w-12 h-12 rounded-full inline mx-3" : "hidden" } />
        <img src="/images/egg.png" className={ avatar ? "hidden" : "w-12 h-12 rounded-full inline mx-3" } />
        <textarea
          type="text"
          rows="1"
          value={message}
          maxLength="280"
          placeholder="What's happening? (in web3)"
          onChange={(e) => setMessage(e.target.value)}
          onInput={(e) => {
            e.target.style.height = "auto"
            e.target.style.height = (e.target.scrollHeight) + "px"
          }}
          className="text-xl grow mr-4 outline-none resize-none"
        />
      </div>
      <div className="flex justify-end items-center">
        <span className="text-gray-500 m-3 mt-1">{message ? message.length + "/280" : ""}</span>
        <button className="button self-end m-3 mt-1" onClick={sendTweet}>Tw33t</button>
      </div>
    </section>
  )
}
