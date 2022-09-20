import { ethers } from "ethers"
import { useState } from "react"
import toast from "react-hot-toast"
import {
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { ModalProps } from "../lib/types.js"
import Avatar from "./Avatar"

export default function TweetModal(props: ModalProps) {
  const [price, setPrice] = useState("")
  const [message, setMessage] = useState("")

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
          console.debug(
            "Retrieved total tweet count --",
            value.data!.toNumber()
          )
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else if (error.message.includes("SenderCooldown()")) {
          toast.error("Please wait 1 minute before tweeting again!")
          console.error("SenderCooldown --", error)
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Submit a new tweet to the contract
   */
  const sendTweet = () => {
    try {
      newTweet({
        args: [message.toString(), 0, 0],
        overrides: { value: ethers.utils.parseEther(price) },
      })
      props.setModal(false)
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  return (
    <>
      {props.modal && (
        <div
          className="fixed inset-0 z-10 bg-gray-500 bg-opacity-50"
          id="modal-overlay"
        />
      )}
      {props.modal && (
        <div
          className="absolute inset-x-0 top-0 z-20 m-auto h-full w-full flex-col rounded-none bg-white md:top-12 md:h-fit md:w-128 md:rounded-xl"
          id="tweet-modal"
        >
          <button
            className="float-right m-2 h-fit w-fit rounded-full p-2 transition duration-200 hover:bg-gray-200"
            onClick={() => props.setModal(false)}
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
          <div className="mt-16 mb-4 flex items-center md:mt-4">
            <Avatar address={props.address} />
            <textarea
              rows={1}
              value={message}
              maxLength={280}
              placeholder="What's happening? (in web3)"
              onChange={(e) => setMessage(e.target.value)}
              onInput={(e) => {
                ;(e.target as HTMLInputElement).style.height = "auto"
                ;(e.target as HTMLInputElement).style.height =
                  (e.target as HTMLInputElement).scrollHeight + "px"
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
              <button className="button m-3 self-end" onClick={sendTweet}>
                Tw33t
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
