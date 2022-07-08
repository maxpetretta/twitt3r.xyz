import { useState } from "react"
import { useEnsAvatar } from "wagmi"

export default function Avatar(props) {
  const [avatar, setAvatar] = useState()
  const seedrandom = require("seedrandom")
  const colors = [
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-sky-400",
    "bg-indigo-400",
    "bg-purple-400",
    "bg-fuchsia-400",
    "bg-rose-400",
  ]

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

  /**
   * Returns a random color based on the given address
   * @param {string} address
   * @returns {string}
   */
  const getColorFromAddress = (address) => {
    const rng = seedrandom(address)
    const index = Math.floor(rng() * 10)
    return colors[index]
  }

  return (
    <>
      <img
        src={avatar}
        className={
          avatar
            ? props.styles
              ? props.styles
              : "mx-3 inline h-12 w-12 self-start rounded-full"
            : "hidden"
        }
      />
      <div
        className={
          avatar
            ? "hidden"
            : props.styles
            ? `${props.styles} ${getColorFromAddress(props.address)}`
            : `mx-3 inline h-12 w-12 self-start rounded-full ${getColorFromAddress(
                props.address
              )}`
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M5.514 14.639c0 3.513 2.904 6.361 6.486 6.361s6.486 -2.848 6.486 -6.361a12.574 12.574 0 0 0 -3.243 -9.012a4.025 4.025 0 0 0 -3.243 -1.627a4.025 4.025 0 0 0 -3.243 1.627a12.574 12.574 0 0 0 -3.243 9.012"></path>
        </svg>
      </div>
    </>
  )
}
