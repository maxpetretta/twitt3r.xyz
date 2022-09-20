import { ethers } from "ethers"
import React, { createContext, useContext, useState } from "react"
import Confetti from "react-confetti"
import toast from "react-hot-toast"
import { useAccount, useContractEvent, useContractRead } from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { Tweet as TweetType } from "../lib/types"

const AppContext = createContext<{
  tweets: Map<number, TweetType> | undefined
  setTweets: React.Dispatch<
    React.SetStateAction<Map<number, TweetType> | undefined>
  >
}>(undefined!)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState("")
  const [tweets, setTweets] = useState<Map<number, TweetType> | undefined>()
  const [confetti, setConfetti] = useState(false)
  useAccount({
    onSuccess(data) {
      if (data.address && !address) {
        setAddress(data.address)
      }
    },
  })

  /**
   * Contract hooks
   */
  useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTweets",
    {
      onSuccess(data) {
        if (data) {
          setTweets((prevState: Map<number, TweetType> | undefined) => {
            let newState = new Map(prevState)
            data.forEach((tweet, id) => {
              newState.set(id + 1, {
                id: id + 1,
                from: tweet[0],
                timestamp: new Date(tweet[1] * 1000),
                message: tweet[2],
                deleted: tweet[3],
                replyID: tweet[4],
                retweetID: tweet[5],
              })
            })
            return newState
          })
        }
      },
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "NewTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.debug(
        "NewTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.set(id.toNumber(), {
          id: id.toNumber(),
          from: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          deleted: deleted,
          replyID: replyID,
          retweetID: retweetID,
        })
        return newState
      })
    },
    {
      once: false,
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "EditTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.debug(
        "EditTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.set(id.toNumber(), {
          id: id.toNumber(),
          from: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          deleted: deleted,
          replyID: replyID,
          retweetID: retweetID,
        })
        return newState
      })
    },
    {
      once: false,
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "DeleteTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.debug(
        "DeleteTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.delete(id.toNumber())
        return newState
      })
    },
    {
      once: false,
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "ClearTweets",
    ([id]) => {
      console.debug("ClearTweets", id.toNumber())

      setTweets(() => {
        return new Map()
      })
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "WonLottery",
    ([winner, jackpot]) => {
      if (winner === address) {
        console.debug("WonLottery", winner, jackpot)
        setConfetti(true)
        toast(
          `Congratulations, you won a jackpot of ${ethers.utils.formatEther(
            jackpot
          )} ether!`,
          {
            duration: 4000,
            icon: "🎉",
          }
        )
      }
    }
  )

  return (
    <AppContext.Provider value={{ tweets, setTweets }}>
      {confetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setConfetti(false)}
        />
      )}
      {children}
    </AppContext.Provider>
  )
}

export const useTweets = () => useContext(AppContext)
