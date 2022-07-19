import Link from "next/link"
import { useState } from "react"
import { useEnsName } from "wagmi"

export default function Address(props) {
  const match = props.address.match(/^(0x.{4}).+(.{4})$/)
  const truncated = match[1] + "..." + match[2]

  const [ens, setEns] = useState(truncated)

  /**
   * Contract hooks
   */
  useEnsName({
    address: props.address,
    onSuccess(data) {
      if (data) {
        setEns(data)
      }
    },
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  return (
    <>
      <Link href={`/${props.address}`}>
        <a
          className={props.styles ? props.styles : "font-semibold text-black"}
          title={props.address}
        >
          {ens}
          {props.suffix ? ` ${props.suffix}` : null}
        </a>
      </Link>
    </>
  )
}
