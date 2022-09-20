import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import { useAccount } from "wagmi"
import Layout from "../components/Layout"

export default function Error404() {
  const [address, setAddress] = useState("")
  useAccount({
    onSuccess(data) {
      if (data.address && !address) {
        setAddress(data.address)
      }
    },
  })

  return (
    <>
      <Head>
        <title>Error 404 - Twitt3r</title>
        <meta name="description" content="That page cannot be found!" />
      </Head>
      <Layout>
        <section className="border-b p-4">
          <h1>Error 404: Rugged!</h1>
          <h3 className="mt-4">Looks like that page does not exist</h3>
          <p className="mt-4">
            The selected profile does not exist, or you are trying to access a
            non-existent page. Try{" "}
            <Link href="/">
              <a>returning home</a>
            </Link>{" "}
            or check out your{" "}
            <Link href={`/${address}`}>
              <a>Twitt3r profile</a>
            </Link>
            .
          </p>
        </section>
      </Layout>
    </>
  )
}
