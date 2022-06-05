import Link from "next/link"
import Layout from "../components/Layout"
import TweetList from "../components/TweetList"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useEnsAvatar, useEnsName, useEnsResolver } from "wagmi"

export default function Profile() {
  // const address = "0x983110309620d911731ac0932219af06091b6744"
  const router = useRouter()
  const { address: address } = router.query
  const [ens, setEns] = useState(address)
  const [description, setDescription] = useState("No ENS description found...")

  /**
   * Contract hooks
   */
  const { data: avatar, isSuccess: avatarSuccess } = useEnsAvatar({
    addressOrName: address,
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  const { data: name, refetch: nameRefetch } = useEnsName({
    address: address,
    enabled: false,
    onSuccess(data) {
      setEns(data ? data : address)
    },
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  const { refetch: resolverRefetch } = useEnsResolver({
    name: name,
    enabled: false,
    onSuccess(data) {
      data.getText("description").then((value) => {
        if (value) {
          setDescription(value)
        }
      })
    },
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  /**
   * On page load fetch the ENS profile description (if exists)
   */
  useEffect(() => {
    setEns(address)
    nameRefetch()
    resolverRefetch()
  }, [address, nameRefetch, resolverRefetch])

  return (
    <>
      <Layout>
        <section className="border-b px-4 pt-4">
          <Link href="/">
            <a className="no-link rounded-full transition duration-200 hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <line x1="5" y1="12" x2="11" y2="18"></line>
                <line x1="5" y1="12" x2="11" y2="6"></line>
              </svg>
            </a>
          </Link>
          <div className="mt-4 h-48 w-full bg-twitter-blue" />
          <div className="relative -top-16">
            <img
              src="/images/egg.png"
              className="ml-4 h-32 w-32 rounded-full border-4 border-white"
            />
            {avatarSuccess && (
              <img
                src={avatar}
                className="absolute top-0 left-0 z-10 ml-4 inline h-32 w-32 rounded-full border-4 border-white"
              />
            )}
            <a href={`https://etherscan.io/address/${address}`}>
              <h1 className="mt-4 text-xl text-black">{ens}</h1>
            </a>
            {name && (
              <h2 className="text-sm font-normal text-gray-600">{address}</h2>
            )}
            <p className="mt-4">{description}</p>
          </div>
        </section>
        <TweetList filter={address} />
      </Layout>
    </>
  )
}
