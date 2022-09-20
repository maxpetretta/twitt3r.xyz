import Link from "next/link"
import { useEffect, useState } from "react"
import { useEnsName } from "wagmi"
import { AddressProps } from "../lib/types"

export default function Address(props: AddressProps) {
  const match = props.address.match(/^(0x.{4}).+(.{4})$/)
  const truncated = match![1] + "..." + match![2]

  const [ens, setEns] = useState(truncated)

  /**
   * Contract hooks
   */
  const { refetch: nameRefetch } = useEnsName({
    address: props.address,
    enabled: false,
    onSuccess(data) {
      if (data) {
        setEns(data)
      }
    },
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  /**
   * On page load, fetch the ENS profile description (if it exists)
   */
  useEffect(() => {
    if (props.address) {
      nameRefetch()
    }
  }, [props.address, nameRefetch])

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
