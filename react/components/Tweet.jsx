import { useState } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Tweet(props) {
  /**
   * Delete the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  const deleteTweet = async (id) => {
    try {
      const provider = await props.loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.deleteTweet(id, { gasLimit: 300000 })
      console.debug("Deleting...", txn.hash)

      await txn.wait()
      console.debug("Deleted -- ", txn.hash)

      let count = await contract.getTotalTweets()
      console.debug("Retrieved total tweet count...", count.toNumber())
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div>
        <button onClick={() => deleteTweet(props.tweet.id)}>✕</button>
        <div>From: {props.tweet.from}</div>
        <div>Time: {props.tweet.timestamp.toString()}</div>
        <div>Message: {props.tweet.message}</div>
      </div>
    </>
  )
}
