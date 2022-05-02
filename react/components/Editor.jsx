import { useState } from "react"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Editor(props) {
  const [message, setMessage] = useState("")

  /**
   * Submit a new tweet to the contract
   */
  const tweet = async () => {
    try {
      const provider = await props.loadProvider()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      let count = await contract.getTotalTweets()
      console.debug("Retrieved total tweet count...", count.toNumber())

      const txn = await contract.tweet(message, {
        value: ethers.utils.parseUnits("0.0002"),
        gasLimit: 300000,
      })
      console.debug("Mining...", txn.hash)

      await txn.wait()
      console.debug("Mined -- ", txn.hash)

      count = await contract.getTotalTweets()
      console.debug("Retrieved total tweet count...", count.toNumber())
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
      <button onClick={tweet}>Tw33t</button>
    </section>
  )
}
