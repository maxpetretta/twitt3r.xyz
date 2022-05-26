import Tweet from "./Tweet"
import { useState } from "react"
import { useContractEvent } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function TweetList() {
  const [tweets, setTweets] = useState(new Map())

  /**
   * Contract hooks
   */
  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI
    },
    "NewTweet",
    ([id, from, timestamp, message]) => {
      console.debug("NewTweet", id.toNumber(), from, new Date(timestamp * 1000), message)
    
      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.set(id.toNumber(), {from: from, timestamp: new Date(timestamp * 1000), message: message})
        return newState
      })
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI
    },
    "EditTweet",
    ([id, from, timestamp, message]) => {
      console.debug("EditTweet", id.toNumber(), from, new Date(timestamp * 1000), message)
    
      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.set(id.toNumber(), {from: from, timestamp: new Date(timestamp * 1000), message: message})
        return newState
      })
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI
    },
    "DeleteTweet",
    ([id, from, timestamp, message]) => {
      console.debug("DeleteTweet", id.toNumber(), from, new Date(timestamp * 1000), message)
    
      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.delete(id.toNumber())
        return newState
      })
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI
    },
    "ClearTweets",
    ([id]) => {
      console.debug("ClearTweets", id.toNumber())
    
      setTweets(() => {
        return new Map()
      })
    }
  )

  return (
    <section>
      {Array.from(tweets, ([id, tweet]) => {
        return (
          <Tweet
            id={id}
            key={id}
            tweet={tweet}
          />
        )
      }).reverse()}
    </section>
  )
}
