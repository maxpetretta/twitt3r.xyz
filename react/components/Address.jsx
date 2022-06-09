import Link from "next/link"
import { useState } from "react"
import { useEnsName } from "wagmi"

export default function Address(props) {
  const [ens, setEns] = useState()

  /**
   * Contract hooks
   */
  useEnsName({
    address: props.address,
    onSuccess(data) {
      if (data) {
        setEns(data)
      } else {
        setEns(truncateAddress(props.address))
      }
    },
    onError(error) {
      setEns(truncateAddress(props.address))
      console.error("Error fetching ENS", error)
    },
  })

  /**
   * Shorten the given address for readability
   * @param {string} address - The sender's wallet address
   */
  const truncateAddress = (address) => {
    const match = address.match(/^(0x.{4}).+(.{4})$/)
    return match[1] + "..." + match[2]
  }

  return (
    <>
      <Link href={`/${props.address}`}>
        <a className="font-semibold text-black" title={props.address}>
          {ens}
        </a>
      </Link>
    </>
  )
}
