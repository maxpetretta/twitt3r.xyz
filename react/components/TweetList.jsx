import Tweet from "./Tweet"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function TweetList(props) {
  const [tweets, setTweets] = useState(new Map())

  /**
   * Get all tweets from the chain, and set them in state
   */
  const getTweets = async () => {
    try {
      const provider = await props.loadProvider()
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      )

      // Listen for NewTweet events
      contract.on("NewTweet", (id, from, timestamp, message) => {
        console.debug("NewTweet", id.toNumber(), from, new Date(timestamp * 1000), message)
    
        setTweets((prevState) => {
          let newState = new Map(prevState)
          newState.set(id.toNumber(), {from: from, timestamp: new Date(timestamp * 1000), message: message})
          return newState
        })
      })

      // Listen for EditTweet events
      contract.on("EditTweet", (id, from, timestamp, message) => {
        console.debug("EditTweet", id.toNumber(), from, new Date(timestamp * 1000), message)

        setTweets((prevState) => {
          let newState = new Map(prevState)
          newState.set(id.toNumber(), {from: from, timestamp: new Date(timestamp * 1000), message: message})
          return newState
        })
      })

      // Listen for DeleteTweet events
      contract.on("DeleteTweet", (id, from, timestamp, message) => {
        console.debug("DeleteTweet", id.toNumber(), from, new Date(timestamp * 1000), message)

        setTweets((prevState) => {
          let newState = new Map(prevState)
          newState.delete(id.toNumber())
          return newState
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  /*
   * On page load, get all existing tweets
   */
  useEffect(() => {
    getTweets()
  }, [])

  return (
    <section>
      {Array.from(tweets, ([id, tweet]) => {
        return (
          <Tweet
            key={id}
            tweet={tweet}
            loadProvider={props.loadProvider}
          />
        )
      })}
    </section>
  )
}
