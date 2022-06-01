import Link from "next/link"
import { ethers } from "ethers"
import { useState } from "react"
import { useAccount, useContractRead, useContractWrite, useEnsAvatar } from "wagmi"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Nav(props) {
  const [price, setPrice] = useState(0)
  const [modal, setModal] = useState(false)
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState("")

  const { data: account, isSuccess: accountSuccess, refetch: accountRefetch } = useAccount({
    onSuccess(data) {
      setAddress(data.address)
    }
  })
  
  /**
   * Contract hooks
   */
  const { data: avatar, isSuccess: avatarSuccess, refetch: avatarRefetch } = useEnsAvatar({
    addressOrName: account ? account.address : "",
    onError(error) {
      console.error(error)
    }
  })

   const { data: priceData, error: priceError, refetch: priceRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getPrice",
    {
      onSuccess(data) {
        setPrice(ethers.utils.formatEther(data))
      }
    }
  )

   const { data: totalTweetsData, error: totalTweetsError, refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

   const { data: tweetData, error: tweetError, write: newTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          console.debug("Tweeted --", data.hash)
          console.debug("Retrieved total tweet count --", value.data.toNumber())
        })
      },
      onError(error) {
        console.error("Transaction failed -- ", error)
      }
    }
  )

  /**
   * Submit a new tweet to the contract
   */
   const sendTweet = () => {
    try {
      newTweet({
        args: message.toString(),
        overrides: { value: ethers.utils.parseEther(price) }
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <nav className="flex flex-col w-1/4 h-screen">
      <Link href="/">
        <a className="transition duration-200 w-min ml-1 mt-1 p-3 rounded-full hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="" width="32" height="32" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path>
          </svg>
        </a>
      </Link>
      <Link href="/">
        <a className="no-link transition duration-200 flex items-center rounded-full text-xl font-medium p-2 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <polyline points="5 12 3 12 12 3 21 12 19 12"></polyline>
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
          </svg>
          <span>Home</span>
        </a>
      </Link>
      <Link href="/">
        <a className="cursor-not-allowed no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 text-gray-400 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="5" y1="9" x2="19" y2="9"></line>
            <line x1="5" y1="15" x2="19" y2="15"></line>
            <line x1="11" y1="4" x2="7" y2="20"></line>
            <line x1="17" y1="4" x2="13" y2="20"></line>
          </svg>
          <span>Explore</span>
        </a>
      </Link>
      <Link href="/">
        <a className="cursor-not-allowed no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 text-gray-400 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
          </svg>
          <span>Communities</span>
        </a>
      </Link>
      <Link href="/">
        <a className="cursor-not-allowed no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 text-gray-400 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
            <path d="M9 17v1a3 3 0 0 0 6 0v-1"></path>
          </svg>
          <span>Notifications</span>
        </a>
      </Link>
      <Link href="/">
        <a className="cursor-not-allowed no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 text-gray-400 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <polyline points="3 7 12 13 21 7"></polyline>
          </svg>
          <span>Messages</span>
        </a>
      </Link>
      <Link href="/">
        <a className="cursor-not-allowed no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 text-gray-400 hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"></path>
        </svg>
        <span>Bookmarks</span>
        </a>
      </Link>
      <Link href={`/${address}`}>
        <a className="no-link transition duration-200 flex items-center rounded-full text-xl font-medium mt-4 p-2 hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 mr-4" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <circle cx="12" cy="7" r="4"></circle>
          <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
        </svg>
        <span>Profile</span>
        </a>
      </Link>
      <button className="button mt-6 place-self-center w-44 h-12" onClick={() => setModal(true)}>Tw33t</button>
      <div className="flex flex-col items-center mt-auto mb-12 text-center">
        <span>Built by <a href="https://maxpetretta.com">Max Petretta</a></span>
        <span>
          Check out the source code on{" "}
          <a href="https://github.com/maxpetretta/twitt3r.xyz">GitHub</a>
        </span>
      </div>
      {modal && <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-10" id="modal-overlay" />}
      {modal && (
        <div className="absolute flex flex-col bg-white w-128 h-80 rounded-xl m-auto inset-x-0 top-0 bottom-1/3 z-20" id="tweet-modal">
          <button className="float-right transition duration-200 rounded-full m-2 p-2 w-fit h-fit hover:bg-gray-200" onClick={() => setModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex items-center mt-4">
            <img src={avatar} className={ avatar ? "w-12 h-12 rounded-full inline mx-3" : "hidden" } />
            <img src="/images/egg.png" className={ avatar ? "hidden" : "w-12 h-12 rounded-full inline mx-3" } />
            <textarea
              type="text"
              rows="1"
              value={message}
              maxLength="280"
              placeholder="What's happening? (in web3)"
              onChange={(e) => setMessage(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = (e.target.scrollHeight) + "px"
              }}
              className="text-xl grow mr-4 outline-none resize-none"
            />
          </div>
          <div className="flex justify-between items-center mt-auto border-t">
            <span className="text-gray-500 text-sm m-3">Price: {price}Ξ</span>
            <div>
              <span className="text-gray-500">{message ? message.length + "/280" : ""}</span>
              <button className="button self-end m-3" onClick={sendTweet}>Tw33t</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
