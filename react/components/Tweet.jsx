import { useState } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Tweet(props) {
  /**
   * Delete the specified tweet from the contract
   * @param {number} index - The tweet index number
   */
  const deleteTweet = async (index) => {
    try {
      const provider = await props.loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const txn = await contract.deleteTweet(index, { gasLimit: 300000 })
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
        <button onClick={() => deleteTweet(props.tweet.index)}>✕</button>
        <div>Address: {props.tweet.address}</div>
        <div>Time: {props.tweet.timestamp.toString()}</div>
        <div>Message: {props.tweet.message}</div>
      </div>
    </>
  )
}
