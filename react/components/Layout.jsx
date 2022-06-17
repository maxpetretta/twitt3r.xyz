import Head from "next/head"
import Nav from "./Nav"
import Sidebar from "./Sidebar"
import { useState } from "react"
import { useRouter } from "next/router"
import { Toaster } from "react-hot-toast"
import { useAccount, useContractRead } from "wagmi"

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

  const [isOwner, setIsOwner] = useState(false)
  const { data: account } = useAccount({
    onSuccess(data) {
      if (data) {
        console.debug("Found authorized account: ", data.address)

        // Check if this is the owner's wallet
        if (
          ownerData &&
          ownerData.toUpperCase() === account.address.toUpperCase()
        ) {
          setIsOwner(true)
        } else {
          setIsOwner(false)
        }
      } else {
        console.debug("No authorized account found")
      }
    },
  })

  /**
   * Contract hooks
   */
  const { data: ownerData } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getOwner"
  )

  return (
    <>
      <Head>
        {/* Dynamic SEO meta tags */}
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://twitt3r.xyz${router.asPath}`} />
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
      <div className="mx-auto min-h-screen max-w-7xl bg-white text-black">
        <div className="flex flex-row">
          <Toaster position="top-right" />
          <Nav />
          <main className="w-1/2 border">{children}</main>
          <Sidebar isOwner={isOwner} />
        </div>
      </div>
    </>
  )
}
