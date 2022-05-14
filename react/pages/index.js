import Header from "../components/Header"
import Editor from "../components/Editor"
import Controls from "../components/Controls"
import TweetList from "../components/TweetList"

import { useEffect, useState } from "react"
import { useAccount, useContractRead } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Index() {
  const { data: account, refetch: accountRefetch } = useAccount()
  const [isOwner, setIsOwner] = useState(false)

  /**
   * Contract hooks
   */
  const { data: ownerData } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getOwner",
    {
      enabled: false,
    }
  )

  /**
   * Check for a previously connected wallet, and if it belongs to the contract owner
   */
  const checkConnectedWallet = async () => {
    try {
      if (account) {
        console.debug("Found an authorized account:", account.address)

        // Check if this is the owner's wallet
        if (ownerData.toUpperCase() === account.address.toUpperCase()) {
          setIsOwner(true)
        }
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * On page load, check for an existing wallet
   */
  useEffect(() => {
    accountRefetch().then(() => {
      checkConnectedWallet()
    })
  })

  return (
    <>
      <Header />
      <section>
        <h1>Welcome to Twitt3r</h1>
        <p>
          Twitt3r is a decentralized web3 version of Twitter built on the
          Ethereum blockchain. Connect your wallet to send, edit (!!!), delete,
          and like tw33ts! You can also check out the source code on{" "}
          <a href="https://github.com/maxpetretta/twitt3r.xyz">GitHub</a>
        </p>
      </section>
      {account && isOwner && <Controls />}
      {account && <Editor />}
      <TweetList />
      <footer>
        <p>
          Built by <a href="https://maxpetretta.com">Max Petretta</a>
        </p>
        <p>
          Check out the source code on{" "}
          <a href="https://github.com/maxpetretta/twitt3r.xyz">GitHub</a>
        </p>
      </footer>
    </>
  )
}
