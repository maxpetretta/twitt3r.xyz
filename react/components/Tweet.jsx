import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"
import { useTweets } from "./AppProvider"
import { contractAddress, contractABI } from "../lib/contract.js"
import toast from "react-hot-toast"
import Avatar from "./Avatar"
import Address from "./Address"

export default function Tweet(props) {
  var relativeTime = require("dayjs/plugin/relativeTime")
  dayjs.extend(relativeTime)

  const [tweet, setTweet] = useState()
  const [retweet, setRetweet] = useState()
  const [price, setPrice] = useState(0)
  const [modal, setModal] = useState(false)
  const [message, setMessage] = useState("")
  const { data: account } = useAccount()
  const { tweets } = useTweets()

  /**
   * Contract hooks
   */
  useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getPrice",
    {
      onSuccess(data) {
        setPrice(ethers.utils.formatEther(data))
      },
    }
  )

  const { refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { write: newTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Sent tweet!")
          console.debug("Tweeted --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  // const {
  //   write: editTweet,
  // } = useContractWrite(
  //   {
  //     addressOrName: contractAddress,
  //     contractInterface: contractABI,
  //   },
  //   "editTweet",
  //   {
  //     onSuccess(data) {
  //       totalTweetsRefetch().then((value) => {
  //         toast.success("Edited tweet!")
  //         console.debug("Edited --", data.hash)
  //         console.debug("Retrieved total tweet count --", value.data.toNumber())
  //       })
  //     },
  //     onError(error) {
  //       if (error instanceof UserRejectedRequestError) {
  //         toast.error("User rejected transaction")
  //         console.error("User rejected transaction")
  //       } else {
  //         toast.error("Transaction failed")
  //         console.error("Transaction failed --", error)
  //       }
  //     },
  //   }
  // )

  const { write: deleteTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "deleteTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Deleted tweet!")
          console.debug("Deleted --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Reply to the specified tweet
   * @param {number} id - The tweet ID number
   */
  const reply = async (id) => {
    try {
      newTweet({
        args: [message.toString(), id, 0],
        overrides: { value: ethers.utils.parseEther(price) },
      })
      setModal(false)
    } catch (error) {
      toast.error("Please wait 1 minute before tweeting again!")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Retweet the specified tweet
   * @param {number} id - The tweet ID number
   */
  const sendRetweet = async (id) => {
    try {
      newTweet({
        args: ["", 0, id],
        overrides: { value: ethers.utils.parseEther(price) },
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Update the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  // const update = async (id, message) => {
  //   try {
  //     editTweet({
  //       args: [id, message],
  //     })
  //   } catch (error) {
  //     toast.error("Transaction failed")
  //     console.error("Transaction failed --", error)
  //   }
  // }

  /**
   * Delete the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  const remove = async (id) => {
    try {
      deleteTweet({
        args: [id],
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Filter for all replies to a tweet
   * @param {number} id
   */
  const getReplies = (id) => {
    let replies = [...tweets.entries()].filter(
      (tweet) => tweet[1].replyID.eq(id) && !tweet[1].deleted
    )
    return replies
  }

  /*
   * On page load, get the relevant tweet
   */
  useEffect(() => {
    if (tweets.get(props.id).retweetID.isZero()) {
      setTweet(tweets.get(props.id))
    } else {
      const retweetID = tweets.get(props.id).retweetID
      setTweet(tweets.get(retweetID.toNumber()))
      setRetweet(tweets.get(props.id))
    }
  }, [tweets, props.id])

  return (
    <>
      {retweet && (
        <div className="ml-2 mt-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline text-gray-500"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
          </svg>
          <Address
            address={retweet.from}
            styles="ml-2 font-semibold text-gray-500"
            suffix="retweeted"
          />
        </div>
      )}
      {tweet && (
        <div className="flex flex-row pt-4 pb-2">
          <Avatar address={tweet.from} />
          <div className="grow">
            <Address address={tweet.from} />
            <span
              className="ml-1"
              title={tweet.timestamp.toLocaleString("en-US", {
                timeStyle: "short",
                dateStyle: "long",
              })}
            >
              - {dayjs(tweet.timestamp).fromNow()}
            </span>
            <div>{tweet.message}</div>
            <div className="mt-1 mr-12 flex justify-between">
              <button
                className="rounded-full p-2 transition duration-200 hover:bg-gray-200"
                onClick={() => setModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                </svg>
              </button>
              <button
                className="rounded-full p-2 transition duration-200 hover:bg-gray-200"
                onClick={() => sendRetweet(props.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
                </svg>
              </button>
              <button className="rounded-full p-2 transition duration-200 hover:bg-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <desc>
                    Download more icon variants from
                    https://tabler-icons.io/i/pencil
                  </desc>
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                  <line x1="13.5" y1="6.5" x2="17.5" y2="10.5"></line>
                </svg>
              </button>
              <button
                className="rounded-full p-2 transition duration-200 hover:bg-gray-200"
                onClick={() => remove(props.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <line x1="4" y1="7" x2="20" y2="7"></line>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <section>
        {props.replies &&
          Array.from(props.replies, ([id, tweet]) => {
            const replies = getReplies(id)
            return <Tweet id={id} key={id} tweet={tweet} replies={replies} />
          })}
      </section>
      {modal && (
        <div
          className="fixed inset-0 z-10 bg-gray-500 bg-opacity-50"
          id="modal-overlay"
        />
      )}
      {modal && (
        <div
          className="absolute inset-x-0 top-12 z-20 m-auto w-128 flex-col rounded-xl bg-white"
          id="reply-modal"
        >
          <button
            className="float-right m-2 h-fit w-fit rounded-full p-2 transition duration-200 hover:bg-gray-200"
            onClick={() => setModal(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="mt-4 flex">
            <Avatar address={tweet.from} />
            <div className="grow">
              <Address address={tweet.from} />
              <span
                className="ml-1"
                title={tweet.timestamp.toLocaleString("en-US", {
                  timeStyle: "short",
                  dateStyle: "long",
                })}
              >
                - {dayjs(tweet.timestamp).fromNow()}
              </span>
              <div>{tweet.message}</div>
              <div className="text mt-4 text-sm text-gray-500">
                Replying to{" "}
                <Address address={tweet.from} styles="font-semibold" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-1 items-center">
            <Avatar address={account.address} />
            <textarea
              type="text"
              rows="1"
              value={message}
              maxLength="280"
              placeholder="Tw33t your reply"
              onChange={(e) => setMessage(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = e.target.scrollHeight + "px"
              }}
              className="mr-4 mb-4 grow resize-none text-xl outline-none"
            />
          </div>
          <div className="mt-auto flex items-center justify-between border-t">
            <span className="m-3 text-sm text-gray-500">Price: {price}Ξ</span>
            <div>
              <span className="text-gray-500">
                {message ? message.length + "/280" : ""}
              </span>
              <button
                className="button m-3 self-end"
                onClick={() => reply(props.id)}
              >
                Tw33t
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
