import { useState, useEffect, useContext, createContext } from "react"
import { useContractRead, useContractEvent } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [tweets, setTweets] = useState(new Map())

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
          setTweets((prevState) => {
            let newState = new Map(prevState)
            data.forEach((tweet, id) => {
              newState.set(id, {from: tweet[0], timestamp: new Date(tweet[1] * 1000), message: tweet[2]})
            })
            return newState
          })
        }
      }
    }
  )

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
    },
    {
      once: false,
    },
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
    },
    {
      once: false,
    },
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
    },
    {
      once: false,
    },
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
    <AppContext.Provider value={{ tweets, setTweets }}>
      {children}
    </AppContext.Provider>
  )
}

export const useTweets = () => useContext(AppContext)
