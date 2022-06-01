import Head from "next/head"
import Nav from "./Nav"
import Sidebar from "./Sidebar"
import { useRouter } from "next/router"
import { useAccount, useContractRead } from "wagmi"

import { useEffect, useState } from "react"
import { contractAddress, contractABI } from "../lib/contract.js"

export default function Layout(props) {
  const { children, ...pageMeta } = props
  const router = useRouter()
  const meta = {
    title: "Twitt3r - What's happening (in web3)",
    description:
      "Twitter, but make it web3.  A decentralized Twitter clone built on the Ethereum blockchain.",
    image: "https://twitt3r.xyz/images/twitter.png",
    type: "website",
    ...pageMeta,
  }

  const { data: account } = useAccount()
  const [isConnected, setIsConnected] = useState(false)
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
        setIsConnected(true)
        console.log("Found an authorized account:", account.address)

        // Check if this is the owner's wallet
        if (ownerData.toUpperCase() === account.address.toUpperCase()) {
          setIsOwner(true)
        }
      } else {
        setIsConnected(false)
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
    if (account) {
      checkConnectedWallet()
    }
  }, [account])

  return (
    <>
      <Head>
        {/* Dynamic SEO meta tags */}
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        <link
          rel="canonical"
          href={`https://twitt3r.xyz${router.asPath}`}
        />
        <meta
          property="og:url"
          content={`https://twitt3r.xyz${router.asPath}`}
        />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.image} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content="Twitt3r" />
        <meta name="twitter:site" content="@maxpetretta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Head>
      <div className="bg-white text-black max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-row">
          <Nav isConnected={isConnected} />
          <main className="w-1/2 border">
            {children}
          </main>
          <Sidebar isConnected={isConnected} isOwner={isOwner} />
        </div>
      </div>
    </>
  )
}
