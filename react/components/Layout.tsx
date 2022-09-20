import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast, Toaster } from "react-hot-toast"
import { useAccount, useContractRead } from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { LayoutProps } from "../lib/types.js"
import Nav from "./Nav"
import Sidebar from "./Sidebar"
import TweetModal from "./TweetModal"

export default function Layout(props: LayoutProps) {
  const { children, ...pageMeta } = props
  const router = useRouter()
  const meta = {
    title: "Twitt3r - What's happening (in web3)",
    description:
      "Twitter, but make it web3.  A decentralized Twitter clone built on the Ethereum blockchain.",
    image: "https://twitt3r.xyz/images/twitt3r.png",
    type: "website",
    ...pageMeta,
  }

  const [modal, setModal] = useState(false)
  const [address, setAddress] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  useAccount({
    onSuccess(data) {
      if (data.address && !address) {
        setAddress(data.address)
        console.debug("Found authorized account: ", data.address)

        // Alert user to which networks are available
        if (!sessionStorage.getItem("seenNetworkAlert")) {
          toast("Twitt3r only supports Goerli & Ropsten testnets!", {
            duration: 8000,
            position: "top-center",
            style: {
              color: "#FFFFFF",
              backgroundColor: "#DC2626",
              minWidth: "460px",
              fontWeight: 600,
            },
            icon: "⚠️",
          })
          sessionStorage.setItem("seenNetworkAlert", "true")
        }

        // Check if this is the owner's wallet
        if (
          ownerData &&
          ownerData.toUpperCase() === data.address!.toUpperCase()
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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Head>
      <div className="mx-auto min-h-screen max-w-7xl bg-white text-black">
        <div className="flex flex-row">
          <Toaster position="top-right" />
          <Nav />
          <main className="w-full border lg:w-1/2">{children}</main>
          <Sidebar isOwner={isOwner} />
        </div>
        <button
          className="fixed bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-twitter-blue md:hidden"
          onClick={() => setModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            strokeWidth="0.1"
            stroke="white"
            fill="white"
          >
            <path d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"></path>
          </svg>
        </button>
        {modal && (
          <TweetModal address={address} modal={modal} setModal={setModal} />
        )}
      </div>
    </>
  )
}
