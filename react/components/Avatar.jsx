import { useState } from "react"
import { useEnsAvatar } from "wagmi"

export default function Avatar(props) {
  const [avatar, setAvatar] = useState()

  /**
   * Contract hooks
   */
  useEnsAvatar({
    addressOrName: props.address,
    onSuccess(data) {
      if (data) {
        setAvatar(data)
      }
    },
    onError(error) {
      console.error("Error fetching ENS", error)
    },
  })

  return (
    <>
      <img
        src={avatar}
        className={avatar ? "mx-3 inline h-12 w-12 rounded-full" : "hidden"}
      />
      <img
        src="/images/egg.png"
        className={avatar ? "hidden" : "mx-3 inline h-12 w-12 rounded-full"}
      />
    </>
  )
}
