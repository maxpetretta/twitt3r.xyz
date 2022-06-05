import Link from "next/link"
import dayjs from "dayjs"
import { useAccount, useContractRead, useContractWrite, useEnsName, useEnsAvatar } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"
import toast from "react-hot-toast"

export default function Tweet(props) {
  var relativeTime = require('dayjs/plugin/relativeTime')
  dayjs.extend(relativeTime)

  const { data: account } = useAccount()

  /**
   * Contract hooks
   */
  const { data: avatar, isSuccess: avatarSuccess, refetch: avatarRefetch } = useEnsAvatar({
    addressOrName: account ? account.address : "",
    onError(error) {
      console.error("Error fetching ENS", error)
    }
  })

  const { data: totalTweetsData, error: totalTweetsError, refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { data: editData, error: editError, write: editTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "editTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Edited tweet!")
          console.debug("Edited --", data.hash)
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
      }
    }
  )

  const { data: deleteData, error: deleteError, write: deleteTweet } = useContractWrite(
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
      }
    }
  )

  /**
   * Update the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
   const updateTweet = async (id, message) => {
    try {
      editTweet({
        args: [id, message]
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Delete the specified tweet from the contract
   * @param {number} id - The tweet ID number
   */
  const removeTweet = async (id) => {
    try {
      deleteTweet({
        args: [id]
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Get the ENS username of the given address
   */
  const getEnsName = (address) => {
    try {
      const { data, isSuccess } = useEnsName({
        address: address
      })

      if (isSuccess) {
        return data
      } else {
        const match = address.match(/^(0x.{4}).+(.{4})$/)
        return (match[1] + "..." + match[2])
      }
    } catch (error) {
      console.error("Error fetching ENS", error)
    }
  }

  return (
    <>
      <div className="flex flex-row pt-4 pb-2 border-b">
        <img src={avatar} className={ avatar ? "w-12 h-12 rounded-full inline mx-3" : "hidden" } />
        <img src="/images/egg.png" className={ avatar ? "hidden" : "w-12 h-12 rounded-full inline mx-3" } />
        <div className="grow">
          <Link href={`/${props.tweet.from}`}>
            <a className="font-semibold text-black" title={props.tweet.from}>{getEnsName(props.tweet.from)}</a>
          </Link>
          <span className="ml-1" title={props.tweet.timestamp.toLocaleString("en-US", { timeStyle: "short", dateStyle: "long" })}>- {dayjs(props.tweet.timestamp).fromNow()}</span>
          <div>{props.tweet.message}</div>
          <div className="flex justify-between mt-1 mr-12">
            <button className="transition duration-200 rounded-full p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
              </svg>
            </button>
            <button className="transition duration-200 rounded-full p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
              </svg>
            </button>
            <button className="transition duration-200 rounded-full p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
              </svg>
            </button>
            <button className="transition duration-200 rounded-full p-2 hover:bg-gray-200" onClick={() => removeTweet(props.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
    </>
  )
}
