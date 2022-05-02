import Tweet from "./Tweet"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function TweetList(props) {
  const [tweets, setTweets] = useState([])

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

      // Listen for new tweet events
      contract.on("NewTweet", (index, from, timestamp, message) => {
        console.debug("NewTweet", index, from, timestamp, message)

        setTweets((prevState) => [
          ...prevState,
          {
            index: index,
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ])
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
      {tweets.map((tweet) => {
        return (
          <Tweet
            key={tweet.index}
            tweet={tweet}
            loadProvider={props.loadProvider}
          />
        )
      })}
    </section>
  )
}
